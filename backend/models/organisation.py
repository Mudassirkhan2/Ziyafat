from typing import Literal
from beanie import Document
from pydantic import BaseModel, Field
from pymongo import ASCENDING, IndexModel


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
    slug: str  # URL-safe, unique, set during setup
    logo_url: str | None = None
    banner_url: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    tagline: str | None = None
    # DLS colors — org's chosen brand colors
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

    class Settings:
        name = "organisations"
        indexes = [
            IndexModel([("slug", ASCENDING)], unique=True),
        ]
