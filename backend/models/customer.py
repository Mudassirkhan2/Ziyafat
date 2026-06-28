from beanie import Document, PydanticObjectId
from pydantic import Field, field_validator
from datetime import datetime, timezone
from typing import Optional
import re
from pymongo import ASCENDING, IndexModel

from models.enums import ContactType

GSTIN_RE = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")


class Customer(Document):
    org_id: PydanticObjectId
    lead_id: Optional[PydanticObjectId] = None
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    # Extended profile
    company_name: Optional[str] = None
    contact_type: Optional[ContactType] = None
    billing_address: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    referral_source: Optional[str] = None
    gstin: Optional[str] = None
    preferred_payment_method: Optional[str] = None
    communication_preference: Optional[str] = None
    account_manager_id: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("gstin")
    @classmethod
    def validate_gstin(cls, v: Optional[str]) -> Optional[str]:
        if v and not GSTIN_RE.match(v):
            raise ValueError("Invalid GSTIN format")
        return v

    class Settings:
        name = "customers"
        indexes = [IndexModel([("org_id", ASCENDING)])]
