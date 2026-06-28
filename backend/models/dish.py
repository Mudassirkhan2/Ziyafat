from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from pymongo import ASCENDING, IndexModel

from models.enums import DishCourse, CuisineType


class RecipeIngredient(BaseModel):
    ingredient_id: PydanticObjectId
    quantity_per_100_guests: float
    unit: str


class Dish(Document):
    org_id: PydanticObjectId
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
    # Extended catalog fields
    course: Optional[DishCourse] = None
    cuisine_type: Optional[CuisineType] = None
    allergens: list[str] = Field(default_factory=list)
    dietary_tags: list[str] = Field(default_factory=list)
    portion_size: Optional[str] = None
    minimum_order_quantity: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    notes_for_kitchen: Optional[str] = None
    is_available_for_storefront: bool = True
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "dishes"
        indexes = [IndexModel([("org_id", ASCENDING)])]
