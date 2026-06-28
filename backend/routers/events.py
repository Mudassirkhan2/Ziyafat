import asyncio
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.event import Event, CateringModel
from models.booking import Booking
from models.user import User, UserRole
from services.procurement_service import generate_procurement_list
from services.pdf_service import render_pdf

router = APIRouter(prefix="/api/v1/bookings", tags=["events"])


class EventResponse(BaseModel):
    id: str
    booking_id: str
    name: str
    date: str  # ISO format date string
    venue: Optional[str]
    guest_count: int
    catering_model: str
    notes: Optional[str]
    menu_dish_ids: list[str]
    created_at: datetime
    updated_at: datetime


class CreateEventBody(BaseModel):
    name: str
    date: date
    venue: Optional[str] = None
    guest_count: int
    catering_model: CateringModel
    notes: Optional[str] = None


class UpdateEventBody(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    venue: Optional[str] = None
    guest_count: Optional[int] = None
    catering_model: Optional[CateringModel] = None
    notes: Optional[str] = None
    menu_dish_ids: Optional[list[str]] = None


def _event_response(event: Event) -> EventResponse:
    # booking.ref.id works when the link hasn't been fetched
    try:
        booking_id = str(event.booking.id)
    except AttributeError:
        booking_id = str(event.booking.ref.id)

    return EventResponse(
        id=str(event.id),
        booking_id=booking_id,
        name=event.name,
        date=event.date.isoformat(),
        venue=event.venue,
        guest_count=event.guest_count,
        catering_model=event.catering_model,
        notes=event.notes,
        menu_dish_ids=[str(d) for d in event.menu_dish_ids],
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


async def _get_booking_or_404(booking_id: str) -> Booking:
    booking = await Booking.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def _verify_event_belongs_to_booking(event: Event, booking_id: str) -> None:
    event_booking_id = str(event.booking.ref.id) if hasattr(event.booking, "ref") else str(event.booking.id)
    if event_booking_id != booking_id:
        raise HTTPException(status_code=404, detail="Event not found")


@router.get("/{booking_id}/events", response_model=list[EventResponse])
async def list_events(
    booking_id: str,
    current_user: User = Depends(get_current_user),
):
    await _get_booking_or_404(booking_id)
    all_events = await Event.find_all().to_list()
    events = [
        e for e in all_events
        if str(e.booking.ref.id if hasattr(e.booking, "ref") else e.booking.id) == booking_id
    ]
    return [_event_response(e) for e in events]


@router.post("/{booking_id}/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    booking_id: str,
    body: CreateEventBody,
    current_user: User = Depends(get_current_user),
):
    booking = await _get_booking_or_404(booking_id)
    now = datetime.now(timezone.utc)
    event = Event(
        booking=booking,
        name=body.name,
        date=body.date,
        venue=body.venue,
        guest_count=body.guest_count,
        catering_model=body.catering_model,
        notes=body.notes,
        created_at=now,
        updated_at=now,
    )
    await event.insert()
    return _event_response(event)


@router.get("/{booking_id}/events/{event_id}", response_model=EventResponse)
async def get_event(
    booking_id: str,
    event_id: str,
    current_user: User = Depends(get_current_user),
):
    await _get_booking_or_404(booking_id)
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    _verify_event_belongs_to_booking(event, booking_id)
    return _event_response(event)


@router.patch("/{booking_id}/events/{event_id}", response_model=EventResponse)
async def update_event(
    booking_id: str,
    event_id: str,
    body: UpdateEventBody,
    current_user: User = Depends(get_current_user),
):
    await _get_booking_or_404(booking_id)
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    _verify_event_belongs_to_booking(event, booking_id)

    if body.name is not None:
        event.name = body.name
    if body.date is not None:
        event.date = body.date
    if body.venue is not None:
        event.venue = body.venue
    if body.guest_count is not None:
        event.guest_count = body.guest_count
    if body.catering_model is not None:
        event.catering_model = body.catering_model
    if body.notes is not None:
        event.notes = body.notes
    if body.menu_dish_ids is not None:
        event.menu_dish_ids = [PydanticObjectId(d) for d in body.menu_dish_ids]

    event.updated_at = datetime.now(timezone.utc)
    await event.save()
    return _event_response(event)


@router.delete("/{booking_id}/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    booking_id: str,
    event_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    await _get_booking_or_404(booking_id)
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    _verify_event_belongs_to_booking(event, booking_id)
    await event.delete()


class ProcurementItemResponse(BaseModel):
    ingredient_id: str
    name: str
    quantity: float
    unit: str
    cost: float
    supplier: Optional[str]


@router.get("/{booking_id}/events/{event_id}/procurement", response_model=list[ProcurementItemResponse])
async def get_event_procurement(
    booking_id: str,
    event_id: str,
    wastage_pct: float = 0.0,
    current_user: User = Depends(get_current_user),
):
    await _get_booking_or_404(booking_id)
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    _verify_event_belongs_to_booking(event, booking_id)
    items = await generate_procurement_list(
        dish_ids=[str(d) for d in event.menu_dish_ids],
        guest_count=event.guest_count,
        wastage_pct=wastage_pct,
    )
    return [
        ProcurementItemResponse(
            ingredient_id=i.ingredient_id,
            name=i.name,
            quantity=i.quantity,
            unit=i.unit,
            cost=i.cost,
            supplier=i.supplier,
        )
        for i in items
    ]


@router.get("/{booking_id}/events/{event_id}/procurement/pdf")
async def get_event_procurement_pdf(
    booking_id: str,
    event_id: str,
    wastage_pct: float = 0.0,
    current_user: User = Depends(get_current_user),
):
    from models.organisation import Organisation
    await _get_booking_or_404(booking_id)
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    _verify_event_belongs_to_booking(event, booking_id)
    items = await generate_procurement_list(
        dish_ids=[str(d) for d in event.menu_dish_ids],
        guest_count=event.guest_count,
        wastage_pct=wastage_pct,
    )
    org = await Organisation.find_one()
    by_supplier: dict[str, list] = {}
    for item in items:
        key = item.supplier or "Other"
        by_supplier.setdefault(key, []).append(item)
    context = {
        "org": org,
        "event": event,
        "by_supplier": by_supplier,
        "wastage_pct": wastage_pct,
        "total_cost": sum(i.cost for i in items),
    }
    pdf_bytes = await asyncio.to_thread(render_pdf, "procurement.html", context)
    filename = f"procurement-{event.name.replace(' ', '-').lower()}.pdf"
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"},
    )
