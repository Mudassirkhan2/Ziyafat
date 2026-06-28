from enum import Enum
from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Link
from pydantic import Field
from beanie import PydanticObjectId
from models.booking import Booking
from models.quotation import Quotation, QuotationLineItem


class InvoiceStatus(str, Enum):
    draft = "draft"
    sent = "sent"
    paid = "paid"


class Invoice(Document):
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "invoices"
