from enum import Enum
from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel
from models.customer import Customer


class BookingStatus(str, Enum):
    confirmed = "confirmed"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Booking(Document):
    org_id: PydanticObjectId
    customer: Link[Customer]
    title: str
    status: BookingStatus = BookingStatus.confirmed
    notes: Optional[str] = None
    # Deposit tracking
    deposit_amount: Optional[float] = None
    deposit_due_date: Optional[date] = None
    deposit_paid_date: Optional[date] = None
    # Contract
    contract_signed: bool = False
    contract_signed_date: Optional[date] = None
    # Logistics
    minimum_guarantee: Optional[int] = None
    booking_manager_id: Optional[PydanticObjectId] = None
    cancellation_policy: Optional[str] = None
    payment_terms: Optional[str] = None
    special_instructions: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "bookings"
        indexes = [IndexModel([("org_id", ASCENDING)])]
