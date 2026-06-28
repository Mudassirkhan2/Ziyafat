from enum import Enum
from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Link
from pydantic import Field
from models.user import User


class LeadStatus(str, Enum):
    new = "new"
    quoted = "quoted"
    negotiating = "negotiating"
    won = "won"
    lost = "lost"


class Lead(Document):
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "leads"
