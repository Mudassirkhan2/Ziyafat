import asyncio
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.booking import Booking, BookingStatus
from models.customer import Customer
from models.user import User, UserRole
from schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


class BookingResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    title: str
    status: str
    notes: Optional[str]
    deposit_amount: Optional[float]
    deposit_due_date: Optional[date]
    deposit_paid_date: Optional[date]
    contract_signed: bool
    contract_signed_date: Optional[date]
    minimum_guarantee: Optional[int]
    booking_manager_id: Optional[str]
    cancellation_policy: Optional[str]
    payment_terms: Optional[str]
    special_instructions: Optional[str]
    created_at: datetime
    updated_at: datetime


class CreateBookingBody(BaseModel):
    customer_id: str
    title: str
    status: BookingStatus = BookingStatus.confirmed
    notes: Optional[str] = None
    deposit_amount: Optional[float] = None
    deposit_due_date: Optional[date] = None
    deposit_paid_date: Optional[date] = None
    contract_signed: bool = False
    contract_signed_date: Optional[date] = None
    minimum_guarantee: Optional[int] = None
    booking_manager_id: Optional[str] = None
    cancellation_policy: Optional[str] = None
    payment_terms: Optional[str] = None
    special_instructions: Optional[str] = None


class UpdateBookingBody(BaseModel):
    title: Optional[str] = None
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None
    deposit_amount: Optional[float] = None
    deposit_due_date: Optional[date] = None
    deposit_paid_date: Optional[date] = None
    contract_signed: Optional[bool] = None
    contract_signed_date: Optional[date] = None
    minimum_guarantee: Optional[int] = None
    booking_manager_id: Optional[str] = None
    cancellation_policy: Optional[str] = None
    payment_terms: Optional[str] = None
    special_instructions: Optional[str] = None


async def _booking_response(booking: Booking) -> BookingResponse:
    await booking.fetch_link(Booking.customer)
    return BookingResponse(
        id=str(booking.id),
        customer_id=str(booking.customer.id),
        customer_name=booking.customer.name,
        title=booking.title,
        status=booking.status,
        notes=booking.notes,
        deposit_amount=booking.deposit_amount,
        deposit_due_date=booking.deposit_due_date,
        deposit_paid_date=booking.deposit_paid_date,
        contract_signed=booking.contract_signed,
        contract_signed_date=booking.contract_signed_date,
        minimum_guarantee=booking.minimum_guarantee,
        booking_manager_id=str(booking.booking_manager_id) if booking.booking_manager_id else None,
        cancellation_policy=booking.cancellation_policy,
        payment_terms=booking.payment_terms,
        special_instructions=booking.special_instructions,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
    )


_BOOKING_SORT_FIELDS = {"title", "status", "created_at"}


@router.get("", response_model=PaginatedResponse[BookingResponse])
async def list_bookings(
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=1000),
    sort_by: str = Query(default="created_at"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in _BOOKING_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(_BOOKING_SORT_FIELDS)}")

    query_filter = {"org_id": current_user.org_id}
    if search:
        query_filter["title"] = {"$regex": search, "$options": "i"}

    sort_str = f"+{sort_by}" if sort_dir == "asc" else f"-{sort_by}"
    skip = (page - 1) * page_size

    total = await Booking.find(query_filter).count()
    raw = await Booking.find(query_filter).sort(sort_str).skip(skip).limit(page_size).to_list()
    items = await asyncio.gather(*[_booking_response(b) for b in raw])

    return PaginatedResponse.build(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: CreateBookingBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    customer = await Customer.get(body.customer_id)
    if not customer or customer.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    now = datetime.now(timezone.utc)
    booking_manager_id = PydanticObjectId(body.booking_manager_id) if body.booking_manager_id else None
    booking = Booking(
        org_id=current_user.org_id,
        customer=customer,
        title=body.title,
        status=body.status,
        notes=body.notes,
        deposit_amount=body.deposit_amount,
        deposit_due_date=body.deposit_due_date,
        deposit_paid_date=body.deposit_paid_date,
        contract_signed=body.contract_signed,
        contract_signed_date=body.contract_signed_date,
        minimum_guarantee=body.minimum_guarantee,
        booking_manager_id=booking_manager_id,
        cancellation_policy=body.cancellation_policy,
        payment_terms=body.payment_terms,
        special_instructions=body.special_instructions,
        created_at=now,
        updated_at=now,
    )
    await booking.insert()
    return await _booking_response(booking)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    booking = await Booking.get(booking_id)
    if not booking or booking.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Booking not found")
    return await _booking_response(booking)


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    body: UpdateBookingBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    booking = await Booking.get(booking_id)
    if not booking or booking.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Booking not found")

    if body.title is not None:
        booking.title = body.title
    if body.status is not None:
        booking.status = body.status
    if body.notes is not None:
        booking.notes = body.notes
    if body.deposit_amount is not None:
        booking.deposit_amount = body.deposit_amount
    if body.deposit_due_date is not None:
        booking.deposit_due_date = body.deposit_due_date
    if body.deposit_paid_date is not None:
        booking.deposit_paid_date = body.deposit_paid_date
    if body.contract_signed is not None:
        booking.contract_signed = body.contract_signed
    if body.contract_signed_date is not None:
        booking.contract_signed_date = body.contract_signed_date
    if body.minimum_guarantee is not None:
        booking.minimum_guarantee = body.minimum_guarantee
    if body.booking_manager_id is not None:
        booking.booking_manager_id = PydanticObjectId(body.booking_manager_id)
    if body.cancellation_policy is not None:
        booking.cancellation_policy = body.cancellation_policy
    if body.payment_terms is not None:
        booking.payment_terms = body.payment_terms
    if body.special_instructions is not None:
        booking.special_instructions = body.special_instructions

    booking.updated_at = datetime.now(timezone.utc)
    await booking.save()
    return await _booking_response(booking)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(
    booking_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    booking = await Booking.get(booking_id)
    if not booking or booking.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Booking not found")
    await booking.delete()
