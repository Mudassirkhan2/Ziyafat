from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.ingredient import Ingredient, SUPPORTED_UNITS
from models.user import User, UserRole


router = APIRouter(prefix="/api/v1/ingredients", tags=["ingredients"])


class IngredientResponse(BaseModel):
    id: str
    name: str
    base_unit: str
    cost_per_unit: float
    supplier: Optional[str]
    stock_on_hand: float
    reorder_threshold: float
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CreateIngredientBody(BaseModel):
    name: str
    base_unit: str
    cost_per_unit: float
    supplier: Optional[str] = None
    stock_on_hand: float = 0.0
    reorder_threshold: float = 0.0


class UpdateIngredientBody(BaseModel):
    name: Optional[str] = None
    base_unit: Optional[str] = None
    cost_per_unit: Optional[float] = None
    supplier: Optional[str] = None
    stock_on_hand: Optional[float] = None
    reorder_threshold: Optional[float] = None
    is_active: Optional[bool] = None


def _ingredient_response(ing: Ingredient) -> IngredientResponse:
    return IngredientResponse(
        id=str(ing.id),
        name=ing.name,
        base_unit=ing.base_unit,
        cost_per_unit=ing.cost_per_unit,
        supplier=ing.supplier,
        stock_on_hand=ing.stock_on_hand,
        reorder_threshold=ing.reorder_threshold,
        is_active=ing.is_active,
        created_at=ing.created_at,
        updated_at=ing.updated_at,
    )


@router.get("", response_model=list[IngredientResponse])
async def list_ingredients(
    active_only: bool = True,
    supplier: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = {}
    if active_only:
        query["is_active"] = True

    ingredients = await Ingredient.find(query).to_list()

    if supplier is not None:
        supplier_lower = supplier.lower()
        ingredients = [
            i for i in ingredients
            if i.supplier is not None and supplier_lower in i.supplier.lower()
        ]

    return [_ingredient_response(i) for i in ingredients]


@router.post("", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
async def create_ingredient(
    body: CreateIngredientBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    if body.base_unit not in SUPPORTED_UNITS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"base_unit must be one of {SUPPORTED_UNITS}",
        )
    now = datetime.now(timezone.utc)
    ingredient = Ingredient(
        name=body.name,
        base_unit=body.base_unit,
        cost_per_unit=body.cost_per_unit,
        supplier=body.supplier,
        stock_on_hand=body.stock_on_hand,
        reorder_threshold=body.reorder_threshold,
        created_at=now,
        updated_at=now,
    )
    await ingredient.insert()
    return _ingredient_response(ingredient)


@router.get("/{ingredient_id}", response_model=IngredientResponse)
async def get_ingredient(
    ingredient_id: str,
    current_user: User = Depends(get_current_user),
):
    ingredient = await Ingredient.get(ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return _ingredient_response(ingredient)


@router.patch("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(
    ingredient_id: str,
    body: UpdateIngredientBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    ingredient = await Ingredient.get(ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    if body.base_unit is not None and body.base_unit not in SUPPORTED_UNITS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"base_unit must be one of {SUPPORTED_UNITS}",
        )

    if body.name is not None:
        ingredient.name = body.name
    if body.base_unit is not None:
        ingredient.base_unit = body.base_unit
    if body.cost_per_unit is not None:
        ingredient.cost_per_unit = body.cost_per_unit
    if body.supplier is not None:
        ingredient.supplier = body.supplier
    if body.stock_on_hand is not None:
        ingredient.stock_on_hand = body.stock_on_hand
    if body.reorder_threshold is not None:
        ingredient.reorder_threshold = body.reorder_threshold
    if body.is_active is not None:
        ingredient.is_active = body.is_active

    ingredient.updated_at = datetime.now(timezone.utc)
    await ingredient.save()
    return _ingredient_response(ingredient)


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ingredient(
    ingredient_id: str,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    ingredient = await Ingredient.get(ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    ingredient.is_active = False
    ingredient.updated_at = datetime.now(timezone.utc)
    await ingredient.save()
