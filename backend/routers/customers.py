from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.customer import Customer
from models.booking import Booking
from models.user import User, UserRole
from models.enums import ContactType
from schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])


class CustomerResponse(BaseModel):
    id: str
    lead_id: Optional[str]
    name: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    notes: Optional[str]
    company_name: Optional[str]
    contact_type: Optional[str]
    billing_address: Optional[str]
    dietary_restrictions: Optional[str]
    referral_source: Optional[str]
    gstin: Optional[str]
    preferred_payment_method: Optional[str]
    communication_preference: Optional[str]
    account_manager_id: Optional[str]
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
    company_name: Optional[str] = None
    contact_type: Optional[ContactType] = None
    billing_address: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    referral_source: Optional[str] = None
    gstin: Optional[str] = None
    preferred_payment_method: Optional[str] = None
    communication_preference: Optional[str] = None
    account_manager_id: Optional[str] = None


class UpdateCustomerBody(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    company_name: Optional[str] = None
    contact_type: Optional[ContactType] = None
    billing_address: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    referral_source: Optional[str] = None
    gstin: Optional[str] = None
    preferred_payment_method: Optional[str] = None
    communication_preference: Optional[str] = None
    account_manager_id: Optional[str] = None


def _customer_response(customer: Customer) -> CustomerResponse:
    return CustomerResponse(
        id=str(customer.id),
        lead_id=str(customer.lead_id) if customer.lead_id else None,
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address,
        notes=customer.notes,
        company_name=customer.company_name,
        contact_type=customer.contact_type,
        billing_address=customer.billing_address,
        dietary_restrictions=customer.dietary_restrictions,
        referral_source=customer.referral_source,
        gstin=customer.gstin,
        preferred_payment_method=customer.preferred_payment_method,
        communication_preference=customer.communication_preference,
        account_manager_id=str(customer.account_manager_id) if customer.account_manager_id else None,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
    )


_CUSTOMER_SORT_FIELDS = {"name", "created_at"}


@router.get("", response_model=PaginatedResponse[CustomerResponse])
async def list_customers(
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="created_at"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in _CUSTOMER_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(_CUSTOMER_SORT_FIELDS)}")

    query_filter = {"org_id": current_user.org_id}
    if search:
        regex = {"$regex": search, "$options": "i"}
        query_filter["$or"] = [
            {"name": regex},
            {"phone": regex},
            {"email": regex},
        ]

    sort_str = f"+{sort_by}" if sort_dir == "asc" else f"-{sort_by}"
    skip = (page - 1) * page_size

    total = await Customer.find(query_filter).count()
    customers = await Customer.find(query_filter).sort(sort_str).skip(skip).limit(page_size).to_list()

    return PaginatedResponse.build(
        items=[_customer_response(c) for c in customers],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    body: CreateCustomerBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    now = datetime.now(timezone.utc)
    account_manager_id = PydanticObjectId(body.account_manager_id) if body.account_manager_id else None
    customer = Customer(
        org_id=current_user.org_id,
        name=body.name,
        phone=body.phone,
        email=body.email,
        address=body.address,
        notes=body.notes,
        company_name=body.company_name,
        contact_type=body.contact_type,
        billing_address=body.billing_address,
        dietary_restrictions=body.dietary_restrictions,
        referral_source=body.referral_source,
        gstin=body.gstin,
        preferred_payment_method=body.preferred_payment_method,
        communication_preference=body.communication_preference,
        account_manager_id=account_manager_id,
        created_at=now,
        updated_at=now,
    )
    await customer.insert()
    return _customer_response(customer)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    customer = await Customer.get(customer_id)
    if not customer or customer.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Customer not found")
    return _customer_response(customer)


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    body: UpdateCustomerBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    customer = await Customer.get(customer_id)
    if not customer or customer.org_id != current_user.org_id:
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
    if body.company_name is not None:
        customer.company_name = body.company_name
    if body.contact_type is not None:
        customer.contact_type = body.contact_type
    if body.billing_address is not None:
        customer.billing_address = body.billing_address
    if body.dietary_restrictions is not None:
        customer.dietary_restrictions = body.dietary_restrictions
    if body.referral_source is not None:
        customer.referral_source = body.referral_source
    if body.gstin is not None:
        customer.gstin = body.gstin
    if body.preferred_payment_method is not None:
        customer.preferred_payment_method = body.preferred_payment_method
    if body.communication_preference is not None:
        customer.communication_preference = body.communication_preference
    if body.account_manager_id is not None:
        customer.account_manager_id = PydanticObjectId(body.account_manager_id)

    customer.updated_at = datetime.now(timezone.utc)
    await customer.save()
    return _customer_response(customer)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    customer = await Customer.get(customer_id)
    if not customer or customer.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Customer not found")
    await customer.delete()


@router.get("/{customer_id}/bookings", response_model=list[BookingResponse])
async def list_customer_bookings(
    customer_id: str,
    current_user: User = Depends(get_current_user),
):
    customer = await Customer.get(customer_id)
    if not customer or customer.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    all_bookings = await Booking.find({"org_id": current_user.org_id}).to_list()
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
