from enum import Enum
from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Link
from pydantic import Field
from models.customer import Customer


class BookingStatus(str, Enum):
    confirmed = "confirmed"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Booking(Document):
    customer: Link[Customer]
    title: str
    status: BookingStatus = BookingStatus.confirmed
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "bookings"
