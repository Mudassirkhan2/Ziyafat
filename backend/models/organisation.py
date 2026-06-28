import re
from datetime import datetime, timezone
from typing import Literal
from beanie import Document
from pydantic import BaseModel, Field, field_validator
from pymongo import ASCENDING, IndexModel

GSTIN_RE = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
IFSC_RE = re.compile(r"^[A-Z]{4}0[A-Z0-9]{6}$")


class ReportHeaderConfig(BaseModel):
    logo_alignment: Literal["left", "center", "right"] = "left"
    show_address: bool = True
    show_phone: bool = True
    show_email: bool = True
    show_tagline: bool = False


class StorefrontSection(BaseModel):
    type: Literal["hero", "dish_grid", "about", "contact"]
    enabled: bool = True
    order: int
    config: dict = Field(default_factory=dict)


class Organisation(Document):
    name: str
    slug: str
    logo_url: str | None = None
    banner_url: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    tagline: str | None = None
    # DLS colors
    primary: str = "#d97706"
    on_primary: str = "#0c0a09"
    primary_container: str = "#451a03"
    on_primary_container: str = "#fed7aa"
    secondary: str = "#f59e0b"
    on_secondary: str = "#0c0a09"
    secondary_container: str = "#78350f"
    on_secondary_container: str = "#fde68a"
    # Config
    report_header: ReportHeaderConfig = Field(default_factory=ReportHeaderConfig)
    storefront_sections: list[StorefrontSection] = Field(default_factory=list)
    # Business identity
    gstin: str | None = None
    website: str | None = None
    # Bank details
    bank_account_name: str | None = None
    bank_account_number: str | None = None
    bank_ifsc: str | None = None
    bank_name: str | None = None
    # Invoice defaults (auto-fill new quotations/invoices)
    default_service_charge_percentage: float = 0.0
    default_tax_rate: float = 0.0
    default_gratuity_percentage: float = 0.0
    default_payment_terms: str | None = None
    default_cancellation_policy: str | None = None
    invoice_prefix: str = "INV"
    # Social
    social_links: dict = Field(default_factory=dict)
    # Onboarding
    setup_completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("gstin")
    @classmethod
    def validate_gstin(cls, v: str | None) -> str | None:
        if v and not GSTIN_RE.match(v):
            raise ValueError("Invalid GSTIN format")
        return v

    @field_validator("bank_ifsc")
    @classmethod
    def validate_ifsc(cls, v: str | None) -> str | None:
        if v and not IFSC_RE.match(v):
            raise ValueError("Invalid IFSC format")
        return v

    class Settings:
        name = "organisations"
        indexes = [
            IndexModel([("slug", ASCENDING)], unique=True),
        ]
