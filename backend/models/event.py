from enum import Enum
from datetime import datetime, date, time, timezone
from typing import Optional
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel
from models.booking import Booking
from models.enums import CeremonyType, ServiceStyle, FoodPreference, EventStatus


class CateringModel(str, Enum):
    per_plate = "per_plate"
    chef_driven = "chef_driven"


class Event(Document):
    org_id: PydanticObjectId
    booking: Link[Booking]
    name: str
    date: date
    venue: Optional[str] = None
    guest_count: int
    catering_model: CateringModel
    notes: Optional[str] = None
    menu_dish_ids: list[PydanticObjectId] = Field(default_factory=list)
    # Scheduling
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    setup_time: Optional[time] = None
    breakdown_time: Optional[time] = None
    food_service_time: Optional[time] = None
    # Classification
    ceremony_type: Optional[CeremonyType] = None
    service_style: Optional[ServiceStyle] = None
    food_preference: Optional[FoodPreference] = None
    event_status: Optional[EventStatus] = None
    # Headcount variants
    veg_count: Optional[int] = None
    non_veg_count: Optional[int] = None
    confirmed_count: Optional[int] = None
    actual_headcount: Optional[int] = None
    # Venue details
    venue_address: Optional[str] = None
    venue_contact: Optional[str] = None
    room_setup_style: Optional[str] = None
    # Operations
    staffing_requirements: Optional[int] = None
    equipment_needed: Optional[str] = None
    kitchen_notes: Optional[str] = None
    access_instructions: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "events"
        indexes = [IndexModel([("org_id", ASCENDING)])]
