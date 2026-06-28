from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.customer import Customer
from models.booking import Booking
from models.user import User, UserRole

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])


class CustomerResponse(BaseModel):
    id: str
    lead_id: Optional[str]
    name: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class BookingResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    title: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class CreateCustomerBody(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class UpdateCustomerBody(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


def _customer_response(customer: Customer) -> CustomerResponse:
    return CustomerResponse(
        id=str(customer.id),
        lead_id=str(customer.lead_id) if customer.lead_id else None,
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address,
        notes=customer.notes,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
    )


@router.get("", response_model=list[CustomerResponse])
async def list_customers(
    search: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
):
    query_filter = {}
    if search:
        regex = {"$regex": search, "$options": "i"}
        query_filter["$or"] = [
            {"name": regex},
            {"phone": regex},
            {"email": regex},
        ]
    customers = await Customer.find(query_filter).to_list()
    return [_customer_response(c) for c in customers]


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    body: CreateCustomerBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    now = datetime.now(timezone.utc)
    customer = Customer(
        name=body.name,
        phone=body.phone,
        email=body.email,
        address=body.address,
        notes=body.notes,
        created_at=now,
        updated_at=now,
    )
    await customer.insert()
    return _customer_response(customer)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    customer = await Customer.get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return _customer_response(customer)


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    body: UpdateCustomerBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    customer = await Customer.get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if body.name is not None:
        customer.name = body.name
    if body.phone is not None:
        customer.phone = body.phone
    if body.email is not None:
        customer.email = body.email
    if body.address is not None:
        customer.address = body.address
    if body.notes is not None:
        customer.notes = body.notes

    customer.updated_at = datetime.now(timezone.utc)
    await customer.save()
    return _customer_response(customer)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    customer = await Customer.get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    await customer.delete()


@router.get("/{customer_id}/bookings", response_model=list[BookingResponse])
async def list_customer_bookings(
    customer_id: str,
    current_user: User = Depends(get_current_user),
):
    customer = await Customer.get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    all_bookings = await Booking.find_all().to_list()
    result = []
    for booking in all_bookings:
        ref_id = booking.customer.ref.id if hasattr(booking.customer, "ref") else booking.customer.id
        if str(ref_id) == customer_id:
            await booking.fetch_link(Booking.customer)
            result.append(
                BookingResponse(
                    id=str(booking.id),
                    customer_id=str(booking.customer.id),
                    customer_name=booking.customer.name,
                    title=booking.title,
                    status=booking.status,
                    notes=booking.notes,
                    created_at=booking.created_at,
                    updated_at=booking.updated_at,
                )
            )
    return result
