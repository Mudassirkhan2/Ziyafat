from enum import Enum
from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel
from models.booking import Booking
from models.quotation import Quotation, QuotationLineItem


class InvoiceStatus(str, Enum):
    draft = "draft"
    sent = "sent"
    paid = "paid"


class Invoice(Document):
    org_id: PydanticObjectId
    booking_id: Link[Booking]
    quotation_id: Optional[Link[Quotation]] = None
    invoice_number: str
    status: InvoiceStatus = InvoiceStatus.draft
    line_items: list[QuotationLineItem] = Field(default_factory=list)
    subtotal: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    due_date: Optional[date] = None
    notes: Optional[str] = None
    # Financial
    invoice_date: Optional[date] = None
    service_charge_amount: float = 0.0
    tax_amount: float = 0.0
    gratuity_amount: float = 0.0
    delivery_fee: float = 0.0
    staffing_fee: float = 0.0
    # Payment tracking
    amount_paid: float = 0.0
    balance_due: float = 0.0
    payment_method: Optional[str] = None
    payment_received_date: Optional[date] = None
    # Event details (denormalized)
    attendees_count: Optional[int] = None
    gstin_customer: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "invoices"
        indexes = [IndexModel([("org_id", ASCENDING)])]
