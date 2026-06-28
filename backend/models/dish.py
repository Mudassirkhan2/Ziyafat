from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field


class RecipeIngredient(BaseModel):
    ingredient_id: PydanticObjectId
    quantity_per_100_guests: float  # in `unit`
    unit: str  # display/input unit; may differ from ingredient.base_unit


class Dish(Document):
    name: str
    category: str
    description: Optional[str] = None
    per_plate_cost: float
    selling_price: float
    is_veg: bool = True
    is_active: bool = True
    image_url: Optional[str] = None
    recipe_ingredients: list[RecipeIngredient] = Field(default_factory=list)
    recipe_cost_per_plate: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "dishes"
