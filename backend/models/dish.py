from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class Dish(Document):
    name: str
    category: str
    description: Optional[str] = None
    per_plate_cost: float
    selling_price: float
    is_veg: bool = True
    is_active: bool = True
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "dishes"
