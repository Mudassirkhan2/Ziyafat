from enum import Enum
from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Link
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from models.booking import Booking


class QuotationStatus(str, Enum):
    draft = "draft"
    sent = "sent"
    approved = "approved"
    rejected = "rejected"
    superseded = "superseded"


class QuotationLineItem(BaseModel):
    dish_id: Optional[PydanticObjectId] = None
    label: str
    qty_per_plate: float
    guest_count: int
    unit_price: float
    total: float


class Quotation(Document):
    booking_id: Link[Booking]
    event_id: Optional[PydanticObjectId] = None
    version: int = 1
    status: QuotationStatus = QuotationStatus.draft
    line_items: list[QuotationLineItem] = Field(default_factory=list)
    subtotal: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None
    valid_until: Optional[date] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "quotations"
