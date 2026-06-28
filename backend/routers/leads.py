from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.lead import Lead, LeadStatus
from models.user import User, UserRole
from models.customer import Customer

router = APIRouter(prefix="/api/v1/leads", tags=["leads"])


class LeadResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str]
    event_type: str
    approx_date: Optional[date]
    approx_guest_count: Optional[int]
    status: str
    source: Optional[str]
    notes: Optional[str]
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime


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


class CreateLeadBody(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    event_type: str
    approx_date: Optional[date] = None
    approx_guest_count: Optional[int] = None
    status: LeadStatus = LeadStatus.new
    source: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None  # User ID string


class UpdateLeadBody(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    event_type: Optional[str] = None
    approx_date: Optional[date] = None
    approx_guest_count: Optional[int] = None
    status: Optional[LeadStatus] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None


def _lead_response(lead: Lead) -> LeadResponse:
    assigned_to_str: Optional[str] = str(lead.assigned_to.ref.id) if lead.assigned_to else None

    return LeadResponse(
        id=str(lead.id),
        name=lead.name,
        phone=lead.phone,
        email=lead.email,
        event_type=lead.event_type,
        approx_date=lead.approx_date,
        approx_guest_count=lead.approx_guest_count,
        status=lead.status,
        source=lead.source,
        notes=lead.notes,
        assigned_to=assigned_to_str,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )


@router.get("", response_model=list[LeadResponse])
async def list_leads(
    status: Optional[LeadStatus] = Query(default=None),
    search: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
):
    query_filter = {}
    if status is not None:
        query_filter["status"] = status.value
    if search:
        regex = {"$regex": search, "$options": "i"}
        query_filter["$or"] = [
            {"name": regex},
            {"phone": regex},
            {"email": regex},
        ]
    leads = await Lead.find(query_filter).to_list()
    return [_lead_response(lead) for lead in leads]


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    body: CreateLeadBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    now = datetime.now(timezone.utc)
    assigned_to_link = None
    if body.assigned_to:
        assigned_user = await User.get(body.assigned_to)
        if not assigned_user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        assigned_to_link = assigned_user

    lead = Lead(
        name=body.name,
        phone=body.phone,
        email=body.email,
        event_type=body.event_type,
        approx_date=body.approx_date,
        approx_guest_count=body.approx_guest_count,
        status=body.status,
        source=body.source,
        notes=body.notes,
        assigned_to=assigned_to_link,
        created_at=now,
        updated_at=now,
    )
    await lead.insert()
    return _lead_response(lead)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, current_user: User = Depends(get_current_user)):
    lead = await Lead.get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return _lead_response(lead)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    body: UpdateLeadBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    lead = await Lead.get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if body.name is not None:
        lead.name = body.name
    if body.phone is not None:
        lead.phone = body.phone
    if body.email is not None:
        lead.email = body.email
    if body.event_type is not None:
        lead.event_type = body.event_type
    if body.approx_date is not None:
        lead.approx_date = body.approx_date
    if body.approx_guest_count is not None:
        lead.approx_guest_count = body.approx_guest_count
    if body.status is not None:
        lead.status = body.status
    if body.source is not None:
        lead.source = body.source
    if body.notes is not None:
        lead.notes = body.notes
    if body.assigned_to is not None:
        assigned_user = await User.get(body.assigned_to)
        if not assigned_user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        lead.assigned_to = assigned_user

    lead.updated_at = datetime.now(timezone.utc)
    await lead.save()
    return _lead_response(lead)


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(
    lead_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    lead = await Lead.get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await lead.delete()


@router.post("/{lead_id}/convert", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def convert_lead(
    lead_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    lead = await Lead.get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    existing = await Customer.find_one(Customer.lead_id == lead.id)
    if existing:
        raise HTTPException(status_code=409, detail="Lead already converted")

    now = datetime.now(timezone.utc)
    customer = Customer(
        lead_id=lead.id,
        name=lead.name,
        phone=lead.phone,
        email=lead.email,
        created_at=now,
        updated_at=now,
    )
    await customer.insert()

    lead.status = LeadStatus.won
    lead.updated_at = now
    await lead.save()

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
