from enum import Enum
from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from models.booking import Booking


class CateringModel(str, Enum):
    per_plate = "per_plate"
    chef_driven = "chef_driven"


class Event(Document):
    booking: Link[Booking]
    name: str
    date: date
    venue: Optional[str] = None
    guest_count: int
    catering_model: CateringModel
    notes: Optional[str] = None
    menu_dish_ids: list[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "events"
