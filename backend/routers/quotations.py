import asyncio
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.quotation import Quotation, QuotationStatus, QuotationLineItem
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


class UpdateQuotationBody(BaseModel):
    status: Optional[QuotationStatus] = None
    line_items: Optional[list[QuotationLineItemBody]] = None
    subtotal: Optional[float] = None
    discount: Optional[float] = None
    total: Optional[float] = None
    notes: Optional[str] = None
    valid_until: Optional[date] = None


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
        created_at=q.created_at,
        updated_at=q.updated_at,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("", response_model=list[QuotationResponse])
async def list_quotations(
    booking_id: Optional[str] = None,
    status: Optional[QuotationStatus] = None,
    current_user: User = Depends(get_current_user),
):
    filters = {}
    if status:
        filters["status"] = status
    quotations = await Quotation.find(filters).to_list()
    if booking_id:
        quotations = [q for q in quotations if _resolve_id(q.booking_id) == booking_id]
    return [await _quotation_response(q) for q in quotations]


@router.post("", response_model=QuotationResponse, status_code=status.HTTP_201_CREATED)
async def create_quotation(
    body: CreateQuotationBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    booking = await Booking.get(body.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    now = datetime.now(timezone.utc)
    quotation = Quotation(
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
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return await _quotation_response(quotation)


@router.patch("/{quotation_id}", response_model=QuotationResponse)
async def update_quotation(
    quotation_id: str,
    body: UpdateQuotationBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    quotation = await Quotation.get(quotation_id)
    if not quotation:
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

    quotation.updated_at = datetime.now(timezone.utc)
    await quotation.save()
    return await _quotation_response(quotation)


@router.delete("/{quotation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quotation(
    quotation_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    quotation = await Quotation.get(quotation_id)
    if not quotation:
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
    if not original:
        raise HTTPException(status_code=404, detail="Quotation not found")

    booking = await Booking.get(_resolve_id(original.booking_id))
    now = datetime.now(timezone.utc)
    new_quotation = Quotation(
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
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    booking = await Booking.get(_resolve_id(quotation.booking_id))
    org = await Organisation.find_one()
    if org is None:
        org = _org_fallback()

    context = {
        "org": org,
        "quotation": quotation,
        "booking": booking,
    }
    pdf_bytes = await asyncio.to_thread(render_pdf, "quotation.html", context)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=quotation-v{quotation.version}.pdf"},
    )
