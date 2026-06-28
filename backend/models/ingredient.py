from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from models.enums import IngredientCategory

SUPPORTED_UNITS = ["g", "kg", "ml", "L", "pcs", "tsp", "tbsp", "cup"]


class Ingredient(Document):
    org_id: PydanticObjectId
    name: str
    base_unit: str
    cost_per_unit: float
    supplier: Optional[str] = None
    stock_on_hand: float = 0.0
    reorder_threshold: float = 0.0
    is_active: bool = True
    # Extended inventory fields
    category: Optional[IngredientCategory] = None
    yield_percentage: float = 100.0
    purchase_unit: Optional[str] = None
    unit_conversion_factor: Optional[float] = None
    allergen_flag: bool = False
    waste_percentage: float = 0.0
    storage_location: Optional[str] = None
    shelf_life_days: Optional[int] = None
    par_level: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "ingredients"
        indexes = [IndexModel([("org_id", ASCENDING)])]
