from enum import Enum
from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel
from models.user import User
from models.enums import CeremonyType, ServiceStyle, FoodPreference


class LeadStatus(str, Enum):
    new = "new"
    quoted = "quoted"
    negotiating = "negotiating"
    won = "won"
    lost = "lost"


class Lead(Document):
    org_id: PydanticObjectId
    name: str
    phone: str
    email: Optional[str] = None
    event_type: str
    approx_date: Optional[date] = None
    approx_guest_count: Optional[int] = None
    status: LeadStatus = LeadStatus.new
    source: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[Link[User]] = None
    # Extended inquiry fields
    budget: Optional[float] = None
    budget_per_person: Optional[float] = None
    ceremony_type: Optional[CeremonyType] = None
    food_preference: Optional[FoodPreference] = None
    service_style: Optional[ServiceStyle] = None
    venue_type: Optional[str] = None
    meal_type: Optional[str] = None
    follow_up_date: Optional[date] = None
    tentative_venue: Optional[str] = None
    number_of_events: Optional[int] = None
    preferred_contact_time: Optional[str] = None
    dietary_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "leads"
        indexes = [IndexModel([("org_id", ASCENDING)])]
