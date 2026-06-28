import asyncio
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.quotation import Quotation, QuotationStatus, QuotationLineItem
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

router = APIRouter(prefix="/api/v1/quotations", tags=["quotations"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class QuotationLineItemBody(BaseModel):
    dish_id: Optional[str] = None
    label: str
    qty_per_plate: float
    guest_count: int
    unit_price: float
    total: float


class QuotationLineItemResponse(BaseModel):
    dish_id: Optional[str]
    label: str
    qty_per_plate: float
    guest_count: int
    unit_price: float
    total: float


class QuotationResponse(BaseModel):
    id: str
    booking_id: str
    event_id: Optional[str]
    version: int
    status: str
    line_items: list[QuotationLineItemResponse]
    subtotal: float
    discount: float
    total: float
    notes: Optional[str]
    valid_until: Optional[date]
    service_charge_percentage: float
    tax_percentage: float
    gratuity_percentage: float
    service_charge_amount: float
    tax_amount: float
    gratuity_amount: float
    delivery_fee: float
    setup_fee: float
    deposit_amount: float
    per_person_price: float
    deposit_percentage: Optional[float]
    deposit_due_date: Optional[date]
    final_balance_due_date: Optional[date]
    signed_date: Optional[date]
    payment_terms_text: Optional[str]
    cancellation_policy_text: Optional[str]
    minimum_guarantee_count: Optional[int]
    client_signature_status: str
    created_at: datetime
    updated_at: datetime


class CreateQuotationBody(BaseModel):
    booking_id: str
    event_id: Optional[str] = None
    line_items: list[QuotationLineItemBody] = []
    subtotal: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None
    valid_until: Optional[date] = None
    service_charge_percentage: float = 0.0
    tax_percentage: float = 0.0
    gratuity_percentage: float = 0.0
    service_charge_amount: float = 0.0
    tax_amount: float = 0.0
    gratuity_amount: float = 0.0
    delivery_fee: float = 0.0
    setup_fee: float = 0.0
    deposit_amount: float = 0.0
    per_person_price: float = 0.0
    deposit_percentage: Optional[float] = None
    deposit_due_date: Optional[date] = None
    final_balance_due_date: Optional[date] = None
    payment_terms_text: Optional[str] = None
    cancellation_policy_text: Optional[str] = None
    minimum_guarantee_count: Optional[int] = None


class UpdateQuotationBody(BaseModel):
    status: Optional[QuotationStatus] = None
    line_items: Optional[list[QuotationLineItemBody]] = None
    subtotal: Optional[float] = None
    discount: Optional[float] = None
    total: Optional[float] = None
    notes: Optional[str] = None
    valid_until: Optional[date] = None
    service_charge_percentage: Optional[float] = None
    tax_percentage: Optional[float] = None
    gratuity_percentage: Optional[float] = None
    service_charge_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    gratuity_amount: Optional[float] = None
    delivery_fee: Optional[float] = None
    setup_fee: Optional[float] = None
    deposit_amount: Optional[float] = None
    per_person_price: Optional[float] = None
    deposit_percentage: Optional[float] = None
    deposit_due_date: Optional[date] = None
    final_balance_due_date: Optional[date] = None
    signed_date: Optional[date] = None
    payment_terms_text: Optional[str] = None
    cancellation_policy_text: Optional[str] = None
    minimum_guarantee_count: Optional[int] = None
    client_signature_status: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_line_items(items: list[QuotationLineItemBody]) -> list[QuotationLineItem]:
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


async def _quotation_response(q: Quotation) -> QuotationResponse:
    return QuotationResponse(
        id=str(q.id),
        booking_id=_resolve_id(q.booking_id),
        event_id=str(q.event_id) if q.event_id else None,
        version=q.version,
        status=q.status,
        line_items=[
            QuotationLineItemResponse(
                dish_id=str(item.dish_id) if item.dish_id else None,
                label=item.label,
                qty_per_plate=item.qty_per_plate,
                guest_count=item.guest_count,
                unit_price=item.unit_price,
                total=item.total,
            )
            for item in q.line_items
        ],
        subtotal=q.subtotal,
        discount=q.discount,
        total=q.total,
        notes=q.notes,
        valid_until=q.valid_until,
        service_charge_percentage=q.service_charge_percentage,
        tax_percentage=q.tax_percentage,
        gratuity_percentage=q.gratuity_percentage,
        service_charge_amount=q.service_charge_amount,
        tax_amount=q.tax_amount,
        gratuity_amount=q.gratuity_amount,
        delivery_fee=q.delivery_fee,
        setup_fee=q.setup_fee,
        deposit_amount=q.deposit_amount,
        per_person_price=q.per_person_price,
        deposit_percentage=q.deposit_percentage,
        deposit_due_date=q.deposit_due_date,
        final_balance_due_date=q.final_balance_due_date,
        signed_date=q.signed_date,
        payment_terms_text=q.payment_terms_text,
        cancellation_policy_text=q.cancellation_policy_text,
        minimum_guarantee_count=q.minimum_guarantee_count,
        client_signature_status=q.client_signature_status,
        created_at=q.created_at,
        updated_at=q.updated_at,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

_QUOTATION_SORT_FIELDS = {"created_at", "total", "status"}


@router.get("", response_model=PaginatedResponse[QuotationResponse])
async def list_quotations(
    booking_id: Optional[str] = None,
    status: Optional[QuotationStatus] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="created_at"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in _QUOTATION_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(_QUOTATION_SORT_FIELDS)}")

    # When filtering by booking_id, fetch all for that booking without DB pagination
    if booking_id:
        filters = {"org_id": current_user.org_id}
        if status:
            filters["status"] = status
        all_q = await Quotation.find(filters).to_list()
        matched = [q for q in all_q if _resolve_id(q.booking_id) == booking_id]
        items = await asyncio.gather(*[_quotation_response(q) for q in matched])
        return PaginatedResponse.build(
            items=list(items), total=len(items), page=1, page_size=len(items) or 1
        )

    filters = {"org_id": current_user.org_id}
    if status:
        filters["status"] = status

    sort_str = f"+{sort_by}" if sort_dir == "asc" else f"-{sort_by}"
    skip = (page - 1) * page_size

    total = await Quotation.find(filters).count()
    quotations = await Quotation.find(filters).sort(sort_str).skip(skip).limit(page_size).to_list()
    items = await asyncio.gather(*[_quotation_response(q) for q in quotations])

    return PaginatedResponse.build(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=QuotationResponse, status_code=status.HTTP_201_CREATED)
async def create_quotation(
    body: CreateQuotationBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    booking = await Booking.get(body.booking_id)
    if not booking or booking.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Booking not found")

    now = datetime.now(timezone.utc)
    quotation = Quotation(
        org_id=current_user.org_id,
        booking_id=booking,
        event_id=PydanticObjectId(body.event_id) if body.event_id else None,
        version=1,
        status=QuotationStatus.draft,
        line_items=_build_line_items(body.line_items),
        subtotal=body.subtotal,
        discount=body.discount,
        total=body.total,
        notes=body.notes,
        valid_until=body.valid_until,
        service_charge_percentage=body.service_charge_percentage,
        tax_percentage=body.tax_percentage,
        gratuity_percentage=body.gratuity_percentage,
        service_charge_amount=body.service_charge_amount,
        tax_amount=body.tax_amount,
        gratuity_amount=body.gratuity_amount,
        delivery_fee=body.delivery_fee,
        setup_fee=body.setup_fee,
        deposit_amount=body.deposit_amount,
        per_person_price=body.per_person_price,
        deposit_percentage=body.deposit_percentage,
        deposit_due_date=body.deposit_due_date,
        final_balance_due_date=body.final_balance_due_date,
        payment_terms_text=body.payment_terms_text,
        cancellation_policy_text=body.cancellation_policy_text,
        minimum_guarantee_count=body.minimum_guarantee_count,
        created_at=now,
        updated_at=now,
    )
    await quotation.insert()
    return await _quotation_response(quotation)


@router.get("/{quotation_id}", response_model=QuotationResponse)
async def get_quotation(
    quotation_id: str,
    current_user: User = Depends(get_current_user),
):
    quotation = await Quotation.get(quotation_id)
    if not quotation or quotation.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return await _quotation_response(quotation)


@router.patch("/{quotation_id}", response_model=QuotationResponse)
async def update_quotation(
    quotation_id: str,
    body: UpdateQuotationBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    quotation = await Quotation.get(quotation_id)
    if not quotation or quotation.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Quotation not found")

    if body.line_items is not None and quotation.status != QuotationStatus.draft:
        raise HTTPException(
            status_code=400,
            detail="Can only modify line items on draft quotations",
        )

    if body.status is not None:
        quotation.status = body.status
    if body.line_items is not None:
        quotation.line_items = _build_line_items(body.line_items)
    if body.subtotal is not None:
        quotation.subtotal = body.subtotal
    if body.discount is not None:
        quotation.discount = body.discount
    if body.total is not None:
        quotation.total = body.total
    if body.notes is not None:
        quotation.notes = body.notes
    if body.valid_until is not None:
        quotation.valid_until = body.valid_until
    if body.service_charge_percentage is not None:
        quotation.service_charge_percentage = body.service_charge_percentage
    if body.tax_percentage is not None:
        quotation.tax_percentage = body.tax_percentage
    if body.gratuity_percentage is not None:
        quotation.gratuity_percentage = body.gratuity_percentage
    if body.service_charge_amount is not None:
        quotation.service_charge_amount = body.service_charge_amount
    if body.tax_amount is not None:
        quotation.tax_amount = body.tax_amount
    if body.gratuity_amount is not None:
        quotation.gratuity_amount = body.gratuity_amount
    if body.delivery_fee is not None:
        quotation.delivery_fee = body.delivery_fee
    if body.setup_fee is not None:
        quotation.setup_fee = body.setup_fee
    if body.deposit_amount is not None:
        quotation.deposit_amount = body.deposit_amount
    if body.per_person_price is not None:
        quotation.per_person_price = body.per_person_price
    if body.deposit_percentage is not None:
        quotation.deposit_percentage = body.deposit_percentage
    if body.deposit_due_date is not None:
        quotation.deposit_due_date = body.deposit_due_date
    if body.final_balance_due_date is not None:
        quotation.final_balance_due_date = body.final_balance_due_date
    if body.signed_date is not None:
        quotation.signed_date = body.signed_date
    if body.payment_terms_text is not None:
        quotation.payment_terms_text = body.payment_terms_text
    if body.cancellation_policy_text is not None:
        quotation.cancellation_policy_text = body.cancellation_policy_text
    if body.minimum_guarantee_count is not None:
        quotation.minimum_guarantee_count = body.minimum_guarantee_count
    if body.client_signature_status is not None:
        quotation.client_signature_status = body.client_signature_status

    quotation.updated_at = datetime.now(timezone.utc)
    await quotation.save()
    return await _quotation_response(quotation)


@router.delete("/{quotation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quotation(
    quotation_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    quotation = await Quotation.get(quotation_id)
    if not quotation or quotation.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Quotation not found")
    if quotation.status != QuotationStatus.draft:
        raise HTTPException(status_code=400, detail="Can only delete draft quotations")
    await quotation.delete()


@router.post("/{quotation_id}/duplicate", response_model=QuotationResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_quotation(
    quotation_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    original = await Quotation.get(quotation_id)
    if not original or original.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Quotation not found")

    booking = await Booking.get(_resolve_id(original.booking_id))
    now = datetime.now(timezone.utc)
    new_quotation = Quotation(
        org_id=current_user.org_id,
        booking_id=booking,
        event_id=original.event_id,
        version=original.version + 1,
        status=QuotationStatus.draft,
        line_items=[
            QuotationLineItem(
                dish_id=item.dish_id,
                label=item.label,
                qty_per_plate=item.qty_per_plate,
                guest_count=item.guest_count,
                unit_price=item.unit_price,
                total=item.total,
            )
            for item in original.line_items
        ],
        subtotal=original.subtotal,
        discount=original.discount,
        total=original.total,
        notes=original.notes,
        valid_until=original.valid_until,
        service_charge_percentage=original.service_charge_percentage,
        tax_percentage=original.tax_percentage,
        gratuity_percentage=original.gratuity_percentage,
        service_charge_amount=original.service_charge_amount,
        tax_amount=original.tax_amount,
        gratuity_amount=original.gratuity_amount,
        delivery_fee=original.delivery_fee,
        setup_fee=original.setup_fee,
        deposit_amount=original.deposit_amount,
        per_person_price=original.per_person_price,
        deposit_percentage=original.deposit_percentage,
        payment_terms_text=original.payment_terms_text,
        cancellation_policy_text=original.cancellation_policy_text,
        minimum_guarantee_count=original.minimum_guarantee_count,
        created_at=now,
        updated_at=now,
    )
    await new_quotation.insert()
    return await _quotation_response(new_quotation)


@router.get("/{quotation_id}/pdf")
async def get_quotation_pdf(
    quotation_id: str,
    current_user: User = Depends(get_current_user),
):
    quotation = await Quotation.get(quotation_id)
    if not quotation or quotation.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Quotation not found")
    booking = await Booking.get(_resolve_id(quotation.booking_id))
    org = await Organisation.get(current_user.org_id)
    if org is None:
        org = _org_fallback()

    context = {
        "org": org,
        "quotation": quotation,
        "booking": booking,
    }
    try:
        pdf_bytes = await asyncio.to_thread(render_pdf, "quotation.html", context)
    except WeasyPrintUnavailableError as e:
        return HTMLResponse(content=e.html)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=quotation-v{quotation.version}.pdf"},
    )
