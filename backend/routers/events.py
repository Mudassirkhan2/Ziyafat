import asyncio
from datetime import datetime, date, time as time_type, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.event import Event, CateringModel
from models.enums import CeremonyType, ServiceStyle, FoodPreference, EventStatus
from models.booking import Booking
from models.user import User, UserRole
from services.procurement_service import generate_procurement_list
from services.pdf_service import render_pdf, WeasyPrintUnavailableError

router = APIRouter(prefix="/api/v1/bookings", tags=["events"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class EventResponse(BaseModel):
    id: str
    booking_id: str
    name: str
    date: str
    venue: Optional[str]
    guest_count: int
    catering_model: str
    notes: Optional[str]
    menu_dish_ids: list[str]
    start_time: Optional[str]
    end_time: Optional[str]
    setup_time: Optional[str]
    breakdown_time: Optional[str]
    food_service_time: Optional[str]
    ceremony_type: Optional[str]
    service_style: Optional[str]
    food_preference: Optional[str]
    event_status: Optional[str]
    veg_count: Optional[int]
    non_veg_count: Optional[int]
    confirmed_count: Optional[int]
    actual_headcount: Optional[int]
    venue_address: Optional[str]
    venue_contact: Optional[str]
    room_setup_style: Optional[str]
    staffing_requirements: Optional[int]
    equipment_needed: Optional[str]
    kitchen_notes: Optional[str]
    access_instructions: Optional[str]
    created_at: datetime
    updated_at: datetime


class CreateEventBody(BaseModel):
    name: str
    date: date
    venue: Optional[str] = None
    guest_count: int
    catering_model: CateringModel
    notes: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    setup_time: Optional[str] = None
    breakdown_time: Optional[str] = None
    food_service_time: Optional[str] = None
    ceremony_type: Optional[CeremonyType] = None
    service_style: Optional[ServiceStyle] = None
    food_preference: Optional[FoodPreference] = None
    event_status: Optional[EventStatus] = None
    veg_count: Optional[int] = None
    non_veg_count: Optional[int] = None
    confirmed_count: Optional[int] = None
    actual_headcount: Optional[int] = None
    venue_address: Optional[str] = None
    venue_contact: Optional[str] = None
    room_setup_style: Optional[str] = None
    staffing_requirements: Optional[int] = None
    equipment_needed: Optional[str] = None
    kitchen_notes: Optional[str] = None
    access_instructions: Optional[str] = None


class UpdateEventBody(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    venue: Optional[str] = None
    guest_count: Optional[int] = None
    catering_model: Optional[CateringModel] = None
    notes: Optional[str] = None
    menu_dish_ids: Optional[list[str]] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    setup_time: Optional[str] = None
    breakdown_time: Optional[str] = None
    food_service_time: Optional[str] = None
    ceremony_type: Optional[CeremonyType] = None
    service_style: Optional[ServiceStyle] = None
    food_preference: Optional[FoodPreference] = None
    event_status: Optional[EventStatus] = None
    veg_count: Optional[int] = None
    non_veg_count: Optional[int] = None
    confirmed_count: Optional[int] = None
    actual_headcount: Optional[int] = None
    venue_address: Optional[str] = None
    venue_contact: Optional[str] = None
    room_setup_style: Optional[str] = None
    staffing_requirements: Optional[int] = None
    equipment_needed: Optional[str] = None
    kitchen_notes: Optional[str] = None
    access_instructions: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_time(t: Optional[str]) -> Optional[time_type]:
    if not t:
        return None
    parts = t.split(":")
    return time_type(int(parts[0]), int(parts[1]))


def _time_str(t: Optional[time_type]) -> Optional[str]:
    return t.isoformat() if t else None


def _event_response(event: Event) -> EventResponse:
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
        start_time=_time_str(event.start_time),
        end_time=_time_str(event.end_time),
        setup_time=_time_str(event.setup_time),
        breakdown_time=_time_str(event.breakdown_time),
        food_service_time=_time_str(event.food_service_time),
        ceremony_type=event.ceremony_type,
        service_style=event.service_style,
        food_preference=event.food_preference,
        event_status=event.event_status,
        veg_count=event.veg_count,
        non_veg_count=event.non_veg_count,
        confirmed_count=event.confirmed_count,
        actual_headcount=event.actual_headcount,
        venue_address=event.venue_address,
        venue_contact=event.venue_contact,
        room_setup_style=event.room_setup_style,
        staffing_requirements=event.staffing_requirements,
        equipment_needed=event.equipment_needed,
        kitchen_notes=event.kitchen_notes,
        access_instructions=event.access_instructions,
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


async def _get_booking_or_404(booking_id: str, org_id) -> Booking:
    booking = await Booking.get(booking_id)
    if not booking or booking.org_id != org_id:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def _verify_event_belongs_to_booking(event: Event, booking_id: str) -> None:
    event_booking_id = str(event.booking.ref.id) if hasattr(event.booking, "ref") else str(event.booking.id)
    if event_booking_id != booking_id:
        raise HTTPException(status_code=404, detail="Event not found")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/{booking_id}/events", response_model=list[EventResponse])
async def list_events(
    booking_id: str,
    current_user: User = Depends(get_current_user),
):
    await _get_booking_or_404(booking_id, current_user.org_id)
    events = await Event.find({"org_id": current_user.org_id, "booking.$id": PydanticObjectId(booking_id)}).to_list()
    return [_event_response(e) for e in events]


@router.post("/{booking_id}/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    booking_id: str,
    body: CreateEventBody,
    current_user: User = Depends(get_current_user),
):
    booking = await _get_booking_or_404(booking_id, current_user.org_id)
    now = datetime.now(timezone.utc)
    event = Event(
        org_id=current_user.org_id,
        booking=booking,
        name=body.name,
        date=body.date,
        venue=body.venue,
        guest_count=body.guest_count,
        catering_model=body.catering_model,
        notes=body.notes,
        start_time=_parse_time(body.start_time),
        end_time=_parse_time(body.end_time),
        setup_time=_parse_time(body.setup_time),
        breakdown_time=_parse_time(body.breakdown_time),
        food_service_time=_parse_time(body.food_service_time),
        ceremony_type=body.ceremony_type,
        service_style=body.service_style,
        food_preference=body.food_preference,
        event_status=body.event_status,
        veg_count=body.veg_count,
        non_veg_count=body.non_veg_count,
        confirmed_count=body.confirmed_count,
        actual_headcount=body.actual_headcount,
        venue_address=body.venue_address,
        venue_contact=body.venue_contact,
        room_setup_style=body.room_setup_style,
        staffing_requirements=body.staffing_requirements,
        equipment_needed=body.equipment_needed,
        kitchen_notes=body.kitchen_notes,
        access_instructions=body.access_instructions,
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
    await _get_booking_or_404(booking_id, current_user.org_id)
    event = await Event.get(event_id)
    if not event or event.org_id != current_user.org_id:
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
    await _get_booking_or_404(booking_id, current_user.org_id)
    event = await Event.get(event_id)
    if not event or event.org_id != current_user.org_id:
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
    if body.start_time is not None:
        event.start_time = _parse_time(body.start_time)
    if body.end_time is not None:
        event.end_time = _parse_time(body.end_time)
    if body.setup_time is not None:
        event.setup_time = _parse_time(body.setup_time)
    if body.breakdown_time is not None:
        event.breakdown_time = _parse_time(body.breakdown_time)
    if body.food_service_time is not None:
        event.food_service_time = _parse_time(body.food_service_time)
    if body.ceremony_type is not None:
        event.ceremony_type = body.ceremony_type
    if body.service_style is not None:
        event.service_style = body.service_style
    if body.food_preference is not None:
        event.food_preference = body.food_preference
    if body.event_status is not None:
        event.event_status = body.event_status
    if body.veg_count is not None:
        event.veg_count = body.veg_count
    if body.non_veg_count is not None:
        event.non_veg_count = body.non_veg_count
    if body.confirmed_count is not None:
        event.confirmed_count = body.confirmed_count
    if body.actual_headcount is not None:
        event.actual_headcount = body.actual_headcount
    if body.venue_address is not None:
        event.venue_address = body.venue_address
    if body.venue_contact is not None:
        event.venue_contact = body.venue_contact
    if body.room_setup_style is not None:
        event.room_setup_style = body.room_setup_style
    if body.staffing_requirements is not None:
        event.staffing_requirements = body.staffing_requirements
    if body.equipment_needed is not None:
        event.equipment_needed = body.equipment_needed
    if body.kitchen_notes is not None:
        event.kitchen_notes = body.kitchen_notes
    if body.access_instructions is not None:
        event.access_instructions = body.access_instructions

    event.updated_at = datetime.now(timezone.utc)
    await event.save()
    return _event_response(event)


@router.delete("/{booking_id}/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    booking_id: str,
    event_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    await _get_booking_or_404(booking_id, current_user.org_id)
    event = await Event.get(event_id)
    if not event or event.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Event not found")
    _verify_event_belongs_to_booking(event, booking_id)
    await event.delete()


# ---------------------------------------------------------------------------
# Procurement routes (unchanged)
# ---------------------------------------------------------------------------

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
    await _get_booking_or_404(booking_id, current_user.org_id)
    event = await Event.get(event_id)
    if not event or event.org_id != current_user.org_id:
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
    await _get_booking_or_404(booking_id, current_user.org_id)
    event = await Event.get(event_id)
    if not event or event.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Event not found")
    _verify_event_belongs_to_booking(event, booking_id)
    items = await generate_procurement_list(
        dish_ids=[str(d) for d in event.menu_dish_ids],
        guest_count=event.guest_count,
        wastage_pct=wastage_pct,
    )
    org = await Organisation.get(current_user.org_id)
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
    try:
        pdf_bytes = await asyncio.to_thread(render_pdf, "procurement.html", context)
    except WeasyPrintUnavailableError as e:
        return HTMLResponse(content=e.html)
    filename = f"procurement-{event.name.replace(' ', '-').lower()}.pdf"
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"},
    )
