from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.lead import Lead, LeadStatus
from models.user import User, UserRole
from models.customer import Customer
from models.enums import CeremonyType, ServiceStyle, FoodPreference
from schemas.pagination import PaginatedResponse

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
    budget: Optional[float]
    budget_per_person: Optional[float]
    ceremony_type: Optional[str]
    food_preference: Optional[str]
    service_style: Optional[str]
    venue_type: Optional[str]
    meal_type: Optional[str]
    tentative_venue: Optional[str]
    preferred_contact_time: Optional[str]
    dietary_notes: Optional[str]
    follow_up_date: Optional[date]
    number_of_events: Optional[int]
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
    assigned_to: Optional[str] = None
    budget: Optional[float] = None
    budget_per_person: Optional[float] = None
    ceremony_type: Optional[CeremonyType] = None
    food_preference: Optional[FoodPreference] = None
    service_style: Optional[ServiceStyle] = None
    venue_type: Optional[str] = None
    meal_type: Optional[str] = None
    tentative_venue: Optional[str] = None
    preferred_contact_time: Optional[str] = None
    dietary_notes: Optional[str] = None
    follow_up_date: Optional[date] = None
    number_of_events: Optional[int] = None


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
    budget: Optional[float] = None
    budget_per_person: Optional[float] = None
    ceremony_type: Optional[CeremonyType] = None
    food_preference: Optional[FoodPreference] = None
    service_style: Optional[ServiceStyle] = None
    venue_type: Optional[str] = None
    meal_type: Optional[str] = None
    tentative_venue: Optional[str] = None
    preferred_contact_time: Optional[str] = None
    dietary_notes: Optional[str] = None
    follow_up_date: Optional[date] = None
    number_of_events: Optional[int] = None


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
        budget=lead.budget,
        budget_per_person=lead.budget_per_person,
        ceremony_type=lead.ceremony_type,
        food_preference=lead.food_preference,
        service_style=lead.service_style,
        venue_type=lead.venue_type,
        meal_type=lead.meal_type,
        tentative_venue=lead.tentative_venue,
        preferred_contact_time=lead.preferred_contact_time,
        dietary_notes=lead.dietary_notes,
        follow_up_date=lead.follow_up_date,
        number_of_events=lead.number_of_events,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )


_LEAD_SORT_FIELDS = {"name", "created_at", "approx_date", "status"}


@router.get("", response_model=PaginatedResponse[LeadResponse])
async def list_leads(
    status: Optional[LeadStatus] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="created_at"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in _LEAD_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(_LEAD_SORT_FIELDS)}")

    query_filter = {"org_id": current_user.org_id}
    if status is not None:
        query_filter["status"] = status.value
    if search:
        regex = {"$regex": search, "$options": "i"}
        query_filter["$or"] = [
            {"name": regex},
            {"phone": regex},
            {"email": regex},
        ]

    sort_str = f"+{sort_by}" if sort_dir == "asc" else f"-{sort_by}"
    skip = (page - 1) * page_size

    total = await Lead.find(query_filter).count()
    leads = await Lead.find(query_filter).sort(sort_str).skip(skip).limit(page_size).to_list()

    return PaginatedResponse.build(
        items=[_lead_response(lead) for lead in leads],
        total=total,
        page=page,
        page_size=page_size,
    )


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
        org_id=current_user.org_id,
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
        budget=body.budget,
        budget_per_person=body.budget_per_person,
        ceremony_type=body.ceremony_type,
        food_preference=body.food_preference,
        service_style=body.service_style,
        venue_type=body.venue_type,
        meal_type=body.meal_type,
        tentative_venue=body.tentative_venue,
        preferred_contact_time=body.preferred_contact_time,
        dietary_notes=body.dietary_notes,
        follow_up_date=body.follow_up_date,
        number_of_events=body.number_of_events,
        created_at=now,
        updated_at=now,
    )
    await lead.insert()
    return _lead_response(lead)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, current_user: User = Depends(get_current_user)):
    lead = await Lead.get(lead_id)
    if not lead or lead.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Lead not found")
    return _lead_response(lead)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    body: UpdateLeadBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    lead = await Lead.get(lead_id)
    if not lead or lead.org_id != current_user.org_id:
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
    if body.budget is not None:
        lead.budget = body.budget
    if body.budget_per_person is not None:
        lead.budget_per_person = body.budget_per_person
    if body.ceremony_type is not None:
        lead.ceremony_type = body.ceremony_type
    if body.food_preference is not None:
        lead.food_preference = body.food_preference
    if body.service_style is not None:
        lead.service_style = body.service_style
    if body.venue_type is not None:
        lead.venue_type = body.venue_type
    if body.meal_type is not None:
        lead.meal_type = body.meal_type
    if body.tentative_venue is not None:
        lead.tentative_venue = body.tentative_venue
    if body.preferred_contact_time is not None:
        lead.preferred_contact_time = body.preferred_contact_time
    if body.dietary_notes is not None:
        lead.dietary_notes = body.dietary_notes
    if body.follow_up_date is not None:
        lead.follow_up_date = body.follow_up_date
    if body.number_of_events is not None:
        lead.number_of_events = body.number_of_events

    lead.updated_at = datetime.now(timezone.utc)
    await lead.save()
    return _lead_response(lead)


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(
    lead_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    lead = await Lead.get(lead_id)
    if not lead or lead.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Lead not found")
    await lead.delete()


@router.post("/{lead_id}/convert", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def convert_lead(
    lead_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    lead = await Lead.get(lead_id)
    if not lead or lead.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Lead not found")

    existing = await Customer.find_one({"lead_id": lead.id, "org_id": current_user.org_id})
    if existing:
        raise HTTPException(status_code=409, detail="Lead already converted")

    now = datetime.now(timezone.utc)
    customer = Customer(
        org_id=current_user.org_id,
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
