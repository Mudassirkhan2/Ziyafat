from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.booking import Booking, BookingStatus
from models.customer import Customer
from models.user import User, UserRole

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


class BookingResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    title: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class CreateBookingBody(BaseModel):
    customer_id: str
    title: str
    notes: Optional[str] = None


class UpdateBookingBody(BaseModel):
    title: Optional[str] = None
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None


async def _booking_response(booking: Booking) -> BookingResponse:
    await booking.fetch_link(Booking.customer)
    return BookingResponse(
        id=str(booking.id),
        customer_id=str(booking.customer.id),
        customer_name=booking.customer.name,
        title=booking.title,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
    )


@router.get("", response_model=list[BookingResponse])
async def list_bookings(current_user: User = Depends(get_current_user)):
    bookings = await Booking.find_all().to_list()
    return [await _booking_response(b) for b in bookings]


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: CreateBookingBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    customer = await Customer.get(body.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    now = datetime.now(timezone.utc)
    booking = Booking(
        customer=customer,
        title=body.title,
        notes=body.notes,
        created_at=now,
        updated_at=now,
    )
    await booking.insert()
    return await _booking_response(booking)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    booking = await Booking.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return await _booking_response(booking)


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    body: UpdateBookingBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    booking = await Booking.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if body.title is not None:
        booking.title = body.title
    if body.status is not None:
        booking.status = body.status
    if body.notes is not None:
        booking.notes = body.notes

    booking.updated_at = datetime.now(timezone.utc)
    await booking.save()
    return await _booking_response(booking)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(
    booking_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    booking = await Booking.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    await booking.delete()
