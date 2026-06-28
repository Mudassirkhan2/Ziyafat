import asyncio
import re
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.invoice import Invoice, InvoiceStatus
from models.quotation import Quotation, QuotationLineItem
from models.booking import Booking
from models.organisation import Organisation
from models.user import User, UserRole
from services.pdf_service import render_pdf, WeasyPrintUnavailableError
from schemas.pagination import PaginatedResponse


def _org_fallback():
    class _ReportHeader:
        logo_alignment = "left"
        show_address = True
        show_phone = True
        show_email = True
        show_tagline = False

    class _OrgFallback:
        name = "Ziyafat"
        logo_url = None
        address = None
        phone = None
        email = None
        tagline = None
        primary = "#d97706"
        report_header = _ReportHeader()

    return _OrgFallback()

router = APIRouter(prefix="/api/v1/invoices", tags=["invoices"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class InvoiceLineItemBody(BaseModel):
    dish_id: Optional[str] = None
    label: str
    qty_per_plate: float
    guest_count: int
    unit_price: float
    total: float


class InvoiceLineItemResponse(BaseModel):
    dish_id: Optional[str]
    label: str
    qty_per_plate: float
    guest_count: int
    unit_price: float
    total: float


class InvoiceResponse(BaseModel):
    id: str
    booking_id: str
    quotation_id: Optional[str]
    invoice_number: str
    status: str
    line_items: list[InvoiceLineItemResponse]
    subtotal: float
    discount: float
    total: float
    due_date: Optional[date]
    notes: Optional[str]
    invoice_date: Optional[date]
    service_charge_amount: float
    tax_amount: float
    gratuity_amount: float
    delivery_fee: float
    staffing_fee: float
    amount_paid: float
    balance_due: float
    payment_method: Optional[str]
    payment_received_date: Optional[date]
    attendees_count: Optional[int]
    gstin_customer: Optional[str]
    created_at: datetime
    updated_at: datetime


class CreateInvoiceBody(BaseModel):
    booking_id: str
    quotation_id: Optional[str] = None
    line_items: list[InvoiceLineItemBody] = []
    subtotal: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    due_date: Optional[date] = None
    notes: Optional[str] = None
    invoice_date: Optional[date] = None
    service_charge_amount: float = 0.0
    tax_amount: float = 0.0
    gratuity_amount: float = 0.0
    delivery_fee: float = 0.0
    staffing_fee: float = 0.0
    amount_paid: float = 0.0
    balance_due: float = 0.0
    payment_method: Optional[str] = None
    payment_received_date: Optional[date] = None
    attendees_count: Optional[int] = None
    gstin_customer: Optional[str] = None


class UpdateInvoiceBody(BaseModel):
    status: Optional[InvoiceStatus] = None
    line_items: Optional[list[InvoiceLineItemBody]] = None
    subtotal: Optional[float] = None
    discount: Optional[float] = None
    total: Optional[float] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    invoice_date: Optional[date] = None
    service_charge_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    gratuity_amount: Optional[float] = None
    delivery_fee: Optional[float] = None
    staffing_fee: Optional[float] = None
    amount_paid: Optional[float] = None
    balance_due: Optional[float] = None
    payment_method: Optional[str] = None
    payment_received_date: Optional[date] = None
    attendees_count: Optional[int] = None
    gstin_customer: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _generate_invoice_number(org_id) -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"INV-{year}-"
    all_invoices = await Invoice.find({"org_id": org_id, "invoice_number": {"$regex": f"^{prefix}"}}).to_list()
    if not all_invoices:
        return f"{prefix}001"
    seqs = []
    for inv in all_invoices:
        match = re.search(r"INV-\d{4}-(\d+)", inv.invoice_number)
        if match:
            seqs.append(int(match.group(1)))
    next_seq = max(seqs) + 1 if seqs else 1
    return f"{prefix}{next_seq:03d}"


def _build_line_items(items: list[InvoiceLineItemBody]) -> list[QuotationLineItem]:
    result = []
    for item in items:
        dish_id = PydanticObjectId(item.dish_id) if item.dish_id else None
        result.append(
            QuotationLineItem(
                dish_id=dish_id,
                label=item.label,
                qty_per_plate=item.qty_per_plate,
                guest_count=item.guest_count,
                unit_price=item.unit_price,
                total=item.total,
            )
        )
    return result


def _resolve_id(link_field) -> str:
    """Extract string ID from a Beanie Link field regardless of fetch state."""
    if hasattr(link_field, 'id'):
        return str(link_field.id)
    return str(link_field.ref.id)


async def _invoice_response(inv: Invoice) -> InvoiceResponse:
    quotation_id_str = None
    if inv.quotation_id:
        try:
            quotation_id_str = _resolve_id(inv.quotation_id)
        except Exception:
            quotation_id_str = None
    return InvoiceResponse(
        id=str(inv.id),
        booking_id=_resolve_id(inv.booking_id),
        quotation_id=quotation_id_str,
        invoice_number=inv.invoice_number,
        status=inv.status,
        line_items=[
            InvoiceLineItemResponse(
                dish_id=str(item.dish_id) if item.dish_id else None,
                label=item.label,
                qty_per_plate=item.qty_per_plate,
                guest_count=item.guest_count,
                unit_price=item.unit_price,
                total=item.total,
            )
            for item in inv.line_items
        ],
        subtotal=inv.subtotal,
        discount=inv.discount,
        total=inv.total,
        due_date=inv.due_date,
        notes=inv.notes,
        invoice_date=inv.invoice_date,
        service_charge_amount=inv.service_charge_amount,
        tax_amount=inv.tax_amount,
        gratuity_amount=inv.gratuity_amount,
        delivery_fee=inv.delivery_fee,
        staffing_fee=inv.staffing_fee,
        amount_paid=inv.amount_paid,
        balance_due=inv.balance_due,
        payment_method=inv.payment_method,
        payment_received_date=inv.payment_received_date,
        attendees_count=inv.attendees_count,
        gstin_customer=inv.gstin_customer,
        created_at=inv.created_at,
        updated_at=inv.updated_at,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

_INVOICE_SORT_FIELDS = {"created_at", "total", "status"}


@router.get("", response_model=PaginatedResponse[InvoiceResponse])
async def list_invoices(
    booking_id: Optional[str] = None,
    status: Optional[InvoiceStatus] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="created_at"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in _INVOICE_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(_INVOICE_SORT_FIELDS)}")

    # When filtering by booking_id, fetch all for that booking without DB pagination
    if booking_id:
        filters = {"org_id": current_user.org_id}
        if status:
            filters["status"] = status
        all_inv = await Invoice.find(filters).to_list()
        matched = [inv for inv in all_inv if _resolve_id(inv.booking_id) == booking_id]
        items = await asyncio.gather(*[_invoice_response(inv) for inv in matched])
        return PaginatedResponse.build(
            items=list(items), total=len(items), page=1, page_size=len(items) or 1
        )

    filters = {"org_id": current_user.org_id}
    if status:
        filters["status"] = status

    sort_str = f"+{sort_by}" if sort_dir == "asc" else f"-{sort_by}"
    skip = (page - 1) * page_size

    total = await Invoice.find(filters).count()
    invoices = await Invoice.find(filters).sort(sort_str).skip(skip).limit(page_size).to_list()
    items = await asyncio.gather(*[_invoice_response(inv) for inv in invoices])

    return PaginatedResponse.build(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    body: CreateInvoiceBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    booking = await Booking.get(body.booking_id)
    if not booking or booking.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Booking not found")

    line_items: list[QuotationLineItem] = []
    subtotal = body.subtotal
    discount = body.discount
    total = body.total
    quotation_link = None

    if body.quotation_id:
        quotation = await Quotation.get(body.quotation_id)
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")
        quotation_link = quotation
        # Body line items take precedence over quotation line items
        if body.line_items:
            line_items = _build_line_items(body.line_items)
        else:
            line_items = [
                QuotationLineItem(
                    dish_id=item.dish_id,
                    label=item.label,
                    qty_per_plate=item.qty_per_plate,
                    guest_count=item.guest_count,
                    unit_price=item.unit_price,
                    total=item.total,
                )
                for item in quotation.line_items
            ]
            subtotal = quotation.subtotal
            discount = quotation.discount
            total = quotation.total
    else:
        line_items = _build_line_items(body.line_items)

    invoice_number = await _generate_invoice_number(current_user.org_id)
    now = datetime.now(timezone.utc)
    invoice = Invoice(
        org_id=current_user.org_id,
        booking_id=booking,
        quotation_id=quotation_link,
        invoice_number=invoice_number,
        status=InvoiceStatus.draft,
        line_items=line_items,
        subtotal=subtotal,
        discount=discount,
        total=total,
        due_date=body.due_date,
        notes=body.notes,
        invoice_date=body.invoice_date,
        service_charge_amount=body.service_charge_amount,
        tax_amount=body.tax_amount,
        gratuity_amount=body.gratuity_amount,
        delivery_fee=body.delivery_fee,
        staffing_fee=body.staffing_fee,
        amount_paid=body.amount_paid,
        balance_due=body.balance_due,
        payment_method=body.payment_method,
        payment_received_date=body.payment_received_date,
        attendees_count=body.attendees_count,
        gstin_customer=body.gstin_customer,
        created_at=now,
        updated_at=now,
    )
    await invoice.insert()
    return await _invoice_response(invoice)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or invoice.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return await _invoice_response(invoice)


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    body: UpdateInvoiceBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or invoice.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if body.line_items is not None and invoice.status != InvoiceStatus.draft:
        raise HTTPException(
            status_code=400,
            detail="Can only modify line items on draft invoices",
        )

    if body.status is not None:
        invoice.status = body.status
    if body.line_items is not None:
        invoice.line_items = _build_line_items(body.line_items)
    if body.subtotal is not None:
        invoice.subtotal = body.subtotal
    if body.discount is not None:
        invoice.discount = body.discount
    if body.total is not None:
        invoice.total = body.total
    if body.due_date is not None:
        invoice.due_date = body.due_date
    if body.notes is not None:
        invoice.notes = body.notes
    if body.invoice_date is not None:
        invoice.invoice_date = body.invoice_date
    if body.service_charge_amount is not None:
        invoice.service_charge_amount = body.service_charge_amount
    if body.tax_amount is not None:
        invoice.tax_amount = body.tax_amount
    if body.gratuity_amount is not None:
        invoice.gratuity_amount = body.gratuity_amount
    if body.delivery_fee is not None:
        invoice.delivery_fee = body.delivery_fee
    if body.staffing_fee is not None:
        invoice.staffing_fee = body.staffing_fee
    if body.amount_paid is not None:
        invoice.amount_paid = body.amount_paid
    if body.balance_due is not None:
        invoice.balance_due = body.balance_due
    if body.payment_method is not None:
        invoice.payment_method = body.payment_method
    if body.payment_received_date is not None:
        invoice.payment_received_date = body.payment_received_date
    if body.attendees_count is not None:
        invoice.attendees_count = body.attendees_count
    if body.gstin_customer is not None:
        invoice.gstin_customer = body.gstin_customer

    invoice.updated_at = datetime.now(timezone.utc)
    await invoice.save()
    return await _invoice_response(invoice)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or invoice.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status != InvoiceStatus.draft:
        raise HTTPException(status_code=400, detail="Can only delete draft invoices")
    await invoice.delete()


@router.get("/{invoice_id}/pdf")
async def get_invoice_pdf(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or invoice.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Invoice not found")
    booking = await Booking.get(_resolve_id(invoice.booking_id))
    org = await Organisation.get(current_user.org_id)
    if org is None:
        org = _org_fallback()

    quotation_version = None
    if invoice.quotation_id:
        try:
            quotation = await Quotation.get(_resolve_id(invoice.quotation_id))
            if quotation:
                quotation_version = quotation.version
        except Exception:
            pass

    context = {
        "org": org,
        "invoice": invoice,
        "booking": booking,
        "quotation_version": quotation_version,
    }
    try:
        pdf_bytes = await asyncio.to_thread(render_pdf, "invoice.html", context)
    except WeasyPrintUnavailableError as e:
        return HTMLResponse(content=e.html)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={invoice.invoice_number}.pdf"},
    )
