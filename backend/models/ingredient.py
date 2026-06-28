from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


SUPPORTED_UNITS = ["g", "kg", "ml", "L", "pcs", "tsp", "tbsp", "cup"]


class Ingredient(Document):
    name: str
    base_unit: str  # one of SUPPORTED_UNITS
    cost_per_unit: float  # cost in ₹ per base_unit
    supplier: Optional[str] = None
    stock_on_hand: float = 0.0
    reorder_threshold: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "ingredients"
