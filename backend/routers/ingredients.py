from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.ingredient import Ingredient, SUPPORTED_UNITS
from models.user import User, UserRole
from models.enums import IngredientCategory
from schemas.pagination import PaginatedResponse


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
    category: Optional[str]
    yield_percentage: float
    purchase_unit: Optional[str]
    unit_conversion_factor: Optional[float]
    allergen_flag: bool
    waste_percentage: float
    storage_location: Optional[str]
    shelf_life_days: Optional[int]
    par_level: Optional[float]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class CreateIngredientBody(BaseModel):
    name: str
    base_unit: str
    cost_per_unit: float
    supplier: Optional[str] = None
    stock_on_hand: float = 0.0
    reorder_threshold: float = 0.0
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


class UpdateIngredientBody(BaseModel):
    name: Optional[str] = None
    base_unit: Optional[str] = None
    cost_per_unit: Optional[float] = None
    supplier: Optional[str] = None
    stock_on_hand: Optional[float] = None
    reorder_threshold: Optional[float] = None
    is_active: Optional[bool] = None
    category: Optional[IngredientCategory] = None
    yield_percentage: Optional[float] = None
    purchase_unit: Optional[str] = None
    unit_conversion_factor: Optional[float] = None
    allergen_flag: Optional[bool] = None
    waste_percentage: Optional[float] = None
    storage_location: Optional[str] = None
    shelf_life_days: Optional[int] = None
    par_level: Optional[float] = None
    notes: Optional[str] = None


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
        category=ing.category,
        yield_percentage=ing.yield_percentage,
        purchase_unit=ing.purchase_unit,
        unit_conversion_factor=ing.unit_conversion_factor,
        allergen_flag=ing.allergen_flag,
        waste_percentage=ing.waste_percentage,
        storage_location=ing.storage_location,
        shelf_life_days=ing.shelf_life_days,
        par_level=ing.par_level,
        notes=ing.notes,
        created_at=ing.created_at,
        updated_at=ing.updated_at,
    )


_INGREDIENT_SORT_FIELDS = {"name", "cost_per_unit", "stock_on_hand"}


@router.get("", response_model=PaginatedResponse[IngredientResponse])
async def list_ingredients(
    active_only: bool = True,
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1),
    sort_by: str = Query(default="name"),
    sort_dir: str = Query(default="asc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in _INGREDIENT_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(_INGREDIENT_SORT_FIELDS)}")

    query = {"org_id": current_user.org_id}
    if active_only:
        query["is_active"] = True
    if search:
        regex = {"$regex": search, "$options": "i"}
        query["$or"] = [{"name": regex}, {"supplier": regex}]

    sort_str = f"+{sort_by}" if sort_dir == "asc" else f"-{sort_by}"
    skip = (page - 1) * page_size

    total = await Ingredient.find(query).count()
    ingredients = await Ingredient.find(query).sort(sort_str).skip(skip).limit(page_size).to_list()

    return PaginatedResponse.build(
        items=[_ingredient_response(i) for i in ingredients],
        total=total,
        page=page,
        page_size=page_size,
    )


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
        org_id=current_user.org_id,
        name=body.name,
        base_unit=body.base_unit,
        cost_per_unit=body.cost_per_unit,
        supplier=body.supplier,
        stock_on_hand=body.stock_on_hand,
        reorder_threshold=body.reorder_threshold,
        category=body.category,
        yield_percentage=body.yield_percentage,
        purchase_unit=body.purchase_unit,
        unit_conversion_factor=body.unit_conversion_factor,
        allergen_flag=body.allergen_flag,
        waste_percentage=body.waste_percentage,
        storage_location=body.storage_location,
        shelf_life_days=body.shelf_life_days,
        par_level=body.par_level,
        notes=body.notes,
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
    if not ingredient or ingredient.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return _ingredient_response(ingredient)


@router.patch("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(
    ingredient_id: str,
    body: UpdateIngredientBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    ingredient = await Ingredient.get(ingredient_id)
    if not ingredient or ingredient.org_id != current_user.org_id:
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
    if body.category is not None:
        ingredient.category = body.category
    if body.yield_percentage is not None:
        ingredient.yield_percentage = body.yield_percentage
    if body.purchase_unit is not None:
        ingredient.purchase_unit = body.purchase_unit
    if body.unit_conversion_factor is not None:
        ingredient.unit_conversion_factor = body.unit_conversion_factor
    if body.allergen_flag is not None:
        ingredient.allergen_flag = body.allergen_flag
    if body.waste_percentage is not None:
        ingredient.waste_percentage = body.waste_percentage
    if body.storage_location is not None:
        ingredient.storage_location = body.storage_location
    if body.shelf_life_days is not None:
        ingredient.shelf_life_days = body.shelf_life_days
    if body.par_level is not None:
        ingredient.par_level = body.par_level
    if body.notes is not None:
        ingredient.notes = body.notes

    ingredient.updated_at = datetime.now(timezone.utc)
    await ingredient.save()
    return _ingredient_response(ingredient)


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ingredient(
    ingredient_id: str,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    ingredient = await Ingredient.get(ingredient_id)
    if not ingredient or ingredient.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    ingredient.is_active = False
    ingredient.updated_at = datetime.now(timezone.utc)
    await ingredient.save()
