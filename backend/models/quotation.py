from enum import Enum
from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Link, PydanticObjectId
from pydantic import BaseModel, Field
from pymongo import ASCENDING, IndexModel
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
    org_id: PydanticObjectId
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
    # Financial charges
    service_charge_percentage: float = 0.0
    service_charge_amount: float = 0.0
    tax_percentage: float = 0.0
    tax_amount: float = 0.0
    gratuity_percentage: float = 0.0
    gratuity_amount: float = 0.0
    delivery_fee: float = 0.0
    setup_fee: float = 0.0
    # Deposit
    deposit_percentage: Optional[float] = None
    deposit_amount: float = 0.0
    deposit_due_date: Optional[date] = None
    final_balance_due_date: Optional[date] = None
    # Terms
    payment_terms_text: Optional[str] = None
    cancellation_policy_text: Optional[str] = None
    minimum_guarantee_count: Optional[int] = None
    per_person_price: float = 0.0
    # Signature
    client_signature_status: str = "unsigned"
    signed_date: Optional[date] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "quotations"
        indexes = [IndexModel([("org_id", ASCENDING)])]
