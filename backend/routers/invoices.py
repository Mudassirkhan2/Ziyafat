import asyncio
import re
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.invoice import Invoice, InvoiceStatus
from models.quotation import Quotation, QuotationLineItem
from models.booking import Booking
from models.organisation import Organisation
from models.user import User, UserRole
from services.pdf_service import render_pdf


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


class UpdateInvoiceBody(BaseModel):
    status: Optional[InvoiceStatus] = None
    line_items: Optional[list[InvoiceLineItemBody]] = None
    subtotal: Optional[float] = None
    discount: Optional[float] = None
    total: Optional[float] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _generate_invoice_number() -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"INV-{year}-"
    all_invoices = await Invoice.find({"invoice_number": {"$regex": f"^{prefix}"}}).to_list()
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
        created_at=inv.created_at,
        updated_at=inv.updated_at,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("", response_model=list[InvoiceResponse])
async def list_invoices(
    booking_id: Optional[str] = None,
    status: Optional[InvoiceStatus] = None,
    current_user: User = Depends(get_current_user),
):
    filters = {}
    if status:
        filters["status"] = status
    invoices = await Invoice.find(filters).to_list()
    if booking_id:
        invoices = [inv for inv in invoices if _resolve_id(inv.booking_id) == booking_id]
    return [await _invoice_response(inv) for inv in invoices]


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    body: CreateInvoiceBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    booking = await Booking.get(body.booking_id)
    if not booking:
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

    invoice_number = await _generate_invoice_number()
    now = datetime.now(timezone.utc)
    invoice = Invoice(
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
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return await _invoice_response(invoice)


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    body: UpdateInvoiceBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice:
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

    invoice.updated_at = datetime.now(timezone.utc)
    await invoice.save()
    return await _invoice_response(invoice)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice:
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
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    booking = await Booking.get(_resolve_id(invoice.booking_id))
    org = await Organisation.find_one()
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
    pdf_bytes = await asyncio.to_thread(render_pdf, "invoice.html", context)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={invoice.invoice_number}.pdf"},
    )
