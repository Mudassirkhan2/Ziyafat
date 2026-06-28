import asyncio
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from beanie import PydanticObjectId
from dependencies import get_current_user, require_role
from models.dish import Dish, RecipeIngredient
from models.ingredient import Ingredient, SUPPORTED_UNITS
from models.organisation import Organisation
from models.user import User, UserRole
from models.enums import DishCourse, CuisineType
from services.cloudinary_service import upload_image, extract_public_id, delete_image
from services.pdf_service import render_pdf, WeasyPrintUnavailableError
from schemas.pagination import PaginatedResponse


def _org_fallback():
    class _ReportHeader:
        logo_alignment = "left"
        show_address = True
        show_phone = True
        show_email = True
        show_tagline = False

    class _OrgFallback:
        name = "Ziyafat"
        logo_url = None
        address = None
        phone = None
        email = None
        tagline = None
        primary = "#d97706"
        report_header = _ReportHeader()

    return _OrgFallback()

router = APIRouter(prefix="/api/v1/dishes", tags=["dishes"])


class DishResponse(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str]
    per_plate_cost: float
    selling_price: float
    is_veg: bool
    is_active: bool
    image_url: Optional[str]
    has_recipe: bool
    recipe_cost_per_plate: Optional[float]
    course: Optional[str]
    cuisine_type: Optional[str]
    allergens: list[str]
    dietary_tags: list[str]
    portion_size: Optional[str]
    minimum_order_quantity: Optional[int]
    preparation_time_minutes: Optional[int]
    notes_for_kitchen: Optional[str]
    is_available_for_storefront: bool
    tags: list[str]
    created_at: datetime
    updated_at: datetime


class CreateDishBody(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    per_plate_cost: float
    selling_price: float
    is_veg: bool = True
    course: Optional[DishCourse] = None
    cuisine_type: Optional[CuisineType] = None
    allergens: list[str] = []
    dietary_tags: list[str] = []
    portion_size: Optional[str] = None
    minimum_order_quantity: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    notes_for_kitchen: Optional[str] = None
    is_available_for_storefront: bool = True
    tags: list[str] = []


class UpdateDishBody(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    per_plate_cost: Optional[float] = None
    selling_price: Optional[float] = None
    is_veg: Optional[bool] = None
    is_active: Optional[bool] = None
    course: Optional[DishCourse] = None
    cuisine_type: Optional[CuisineType] = None
    allergens: Optional[list[str]] = None
    dietary_tags: Optional[list[str]] = None
    portion_size: Optional[str] = None
    minimum_order_quantity: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    notes_for_kitchen: Optional[str] = None
    is_available_for_storefront: Optional[bool] = None
    tags: Optional[list[str]] = None


class RecipeIngredientBody(BaseModel):
    ingredient_id: str
    quantity_per_100_guests: float
    unit: str


class RecipeBody(BaseModel):
    ingredients: list[RecipeIngredientBody]


class RecipeIngredientResponse(BaseModel):
    ingredient_id: str
    ingredient_name: str
    quantity_per_100_guests: float
    unit: str
    cost_per_plate: float


class RecipeResponse(BaseModel):
    dish_id: str
    ingredients: list[RecipeIngredientResponse]
    recipe_cost_per_plate: float


def _dish_response(dish: Dish) -> DishResponse:
    return DishResponse(
        id=str(dish.id),
        name=dish.name,
        category=dish.category,
        description=dish.description,
        per_plate_cost=dish.per_plate_cost,
        selling_price=dish.selling_price,
        is_veg=dish.is_veg,
        is_active=dish.is_active,
        image_url=dish.image_url,
        has_recipe=len(dish.recipe_ingredients) > 0,
        recipe_cost_per_plate=dish.recipe_cost_per_plate,
        course=dish.course,
        cuisine_type=dish.cuisine_type,
        allergens=dish.allergens,
        dietary_tags=dish.dietary_tags,
        portion_size=dish.portion_size,
        minimum_order_quantity=dish.minimum_order_quantity,
        preparation_time_minutes=dish.preparation_time_minutes,
        notes_for_kitchen=dish.notes_for_kitchen,
        is_available_for_storefront=dish.is_available_for_storefront,
        tags=dish.tags,
        created_at=dish.created_at,
        updated_at=dish.updated_at,
    )


_CONVERT: dict[tuple[str, str], float] = {
    ("g", "kg"): 0.001, ("kg", "g"): 1000.0,
    ("ml", "L"): 0.001, ("L", "ml"): 1000.0,
}


def _to_base(qty: float, from_unit: str, base_unit: str) -> float:
    if from_unit == base_unit:
        return qty
    return qty * _CONVERT.get((from_unit, base_unit), 1.0)


async def _compute_recipe_cost(recipe: list) -> float:
    total = 0.0
    for ri in recipe:
        ing = await Ingredient.get(ri.ingredient_id)
        if ing is None:
            continue
        qty_in_base = _to_base(ri.quantity_per_100_guests, ri.unit, ing.base_unit)
        total += (qty_in_base / 100) * ing.cost_per_unit
    return round(total, 2)


_DISH_SORT_FIELDS = {"name", "category", "selling_price", "per_plate_cost"}


@router.get("", response_model=PaginatedResponse[DishResponse])
async def list_dishes(
    category: Optional[str] = None,
    is_veg: Optional[bool] = None,
    active_only: bool = True,
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="name"),
    sort_dir: str = Query(default="asc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in _DISH_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(_DISH_SORT_FIELDS)}")

    query = {"org_id": current_user.org_id}
    if active_only:
        query["is_active"] = True
    if is_veg is not None:
        query["is_veg"] = is_veg
    if search:
        regex = {"$regex": search, "$options": "i"}
        query["$or"] = [{"name": regex}, {"category": regex}]
    elif category is not None:
        query["category"] = {"$regex": category, "$options": "i"}

    sort_str = f"+{sort_by}" if sort_dir == "asc" else f"-{sort_by}"
    skip = (page - 1) * page_size

    total = await Dish.find(query).count()
    dishes = await Dish.find(query).sort(sort_str).skip(skip).limit(page_size).to_list()

    return PaginatedResponse.build(
        items=[_dish_response(d) for d in dishes],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=DishResponse, status_code=status.HTTP_201_CREATED)
async def create_dish(
    body: CreateDishBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    now = datetime.now(timezone.utc)
    dish = Dish(
        org_id=current_user.org_id,
        name=body.name,
        category=body.category,
        description=body.description,
        per_plate_cost=body.per_plate_cost,
        selling_price=body.selling_price,
        is_veg=body.is_veg,
        course=body.course,
        cuisine_type=body.cuisine_type,
        allergens=body.allergens,
        dietary_tags=body.dietary_tags,
        portion_size=body.portion_size,
        minimum_order_quantity=body.minimum_order_quantity,
        preparation_time_minutes=body.preparation_time_minutes,
        notes_for_kitchen=body.notes_for_kitchen,
        is_available_for_storefront=body.is_available_for_storefront,
        tags=body.tags,
        created_at=now,
        updated_at=now,
    )
    await dish.insert()
    return _dish_response(dish)


@router.get("/pdf")
async def get_dishes_pdf(current_user: User = Depends(get_current_user)):
    dishes = await Dish.find({"org_id": current_user.org_id, "is_active": True}).to_list()
    org = await Organisation.get(current_user.org_id)
    if org is None:
        org = _org_fallback()

    grouped: dict[str, list] = {}
    for dish in dishes:
        grouped.setdefault(dish.category, []).append(dish)

    context = {
        "org": org,
        "grouped_dishes": grouped,
    }
    try:
        pdf_bytes = await asyncio.to_thread(render_pdf, "dish_list.html", context)
    except WeasyPrintUnavailableError as e:
        return HTMLResponse(content=e.html)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=dish-catalog.pdf"},
    )


@router.get("/{dish_id}", response_model=DishResponse)
async def get_dish(dish_id: str, current_user: User = Depends(get_current_user)):
    dish = await Dish.get(dish_id)
    if not dish or dish.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Dish not found")
    return _dish_response(dish)


@router.patch("/{dish_id}", response_model=DishResponse)
async def update_dish(
    dish_id: str,
    body: UpdateDishBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    dish = await Dish.get(dish_id)
    if not dish or dish.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Dish not found")

    if body.name is not None:
        dish.name = body.name
    if body.category is not None:
        dish.category = body.category
    if body.description is not None:
        dish.description = body.description
    if body.per_plate_cost is not None:
        dish.per_plate_cost = body.per_plate_cost
    if body.selling_price is not None:
        dish.selling_price = body.selling_price
    if body.is_veg is not None:
        dish.is_veg = body.is_veg
    if body.is_active is not None:
        dish.is_active = body.is_active
    if body.course is not None:
        dish.course = body.course
    if body.cuisine_type is not None:
        dish.cuisine_type = body.cuisine_type
    if body.allergens is not None:
        dish.allergens = body.allergens
    if body.dietary_tags is not None:
        dish.dietary_tags = body.dietary_tags
    if body.portion_size is not None:
        dish.portion_size = body.portion_size
    if body.minimum_order_quantity is not None:
        dish.minimum_order_quantity = body.minimum_order_quantity
    if body.preparation_time_minutes is not None:
        dish.preparation_time_minutes = body.preparation_time_minutes
    if body.notes_for_kitchen is not None:
        dish.notes_for_kitchen = body.notes_for_kitchen
    if body.is_available_for_storefront is not None:
        dish.is_available_for_storefront = body.is_available_for_storefront
    if body.tags is not None:
        dish.tags = body.tags

    dish.updated_at = datetime.now(timezone.utc)
    await dish.save()
    return _dish_response(dish)


@router.delete("/{dish_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dish(
    dish_id: str,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    dish = await Dish.get(dish_id)
    if not dish or dish.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Dish not found")
    dish.is_active = False
    dish.updated_at = datetime.now(timezone.utc)
    await dish.save()


@router.post("/{dish_id}/image", response_model=DishResponse)
async def upload_dish_image(
    dish_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    dish = await Dish.get(dish_id)
    if not dish or dish.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Dish not found")
    file_bytes = await file.read()
    url = await asyncio.to_thread(upload_image, file_bytes, "ziyafat/dishes", dish_id)
    dish.image_url = url
    dish.updated_at = datetime.now(timezone.utc)
    await dish.save()
    return _dish_response(dish)


@router.delete("/{dish_id}/image", response_model=DishResponse)
async def delete_dish_image(
    dish_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    dish = await Dish.get(dish_id)
    if not dish or dish.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Dish not found")
    if not dish.image_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No image to remove")
    public_id = extract_public_id(dish.image_url)
    if public_id:
        await asyncio.to_thread(delete_image, public_id)
    dish.image_url = None
    dish.updated_at = datetime.now(timezone.utc)
    await dish.save()
    return _dish_response(dish)


@router.get("/{dish_id}/recipe", response_model=RecipeResponse)
async def get_dish_recipe(
    dish_id: str,
    current_user: User = Depends(get_current_user),
):
    dish = await Dish.get(dish_id)
    if not dish or dish.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Dish not found")

    items = []
    for ri in dish.recipe_ingredients:
        ing = await Ingredient.get(ri.ingredient_id)
        if ing is None:
            continue
        qty_in_base = _to_base(ri.quantity_per_100_guests, ri.unit, ing.base_unit)
        cost = round((qty_in_base / 100) * ing.cost_per_unit, 4)
        items.append(RecipeIngredientResponse(
            ingredient_id=str(ri.ingredient_id),
            ingredient_name=ing.name,
            quantity_per_100_guests=ri.quantity_per_100_guests,
            unit=ri.unit,
            cost_per_plate=cost,
        ))

    return RecipeResponse(
        dish_id=dish_id,
        ingredients=items,
        recipe_cost_per_plate=dish.recipe_cost_per_plate or 0.0,
    )


@router.put("/{dish_id}/recipe", response_model=RecipeResponse)
async def replace_dish_recipe(
    dish_id: str,
    body: RecipeBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    dish = await Dish.get(dish_id)
    if not dish or dish.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Dish not found")

    # Validate all ingredients and cache fetched objects to avoid double-fetch
    validated: list[tuple[RecipeIngredientBody, Ingredient]] = []
    for item in body.ingredients:
        if item.unit not in SUPPORTED_UNITS:
            raise HTTPException(status_code=422, detail=f"unit '{item.unit}' not supported")
        ing = await Ingredient.get(item.ingredient_id)
        if ing is None:
            raise HTTPException(status_code=422, detail=f"Ingredient {item.ingredient_id} not found")
        if item.unit != ing.base_unit and (item.unit, ing.base_unit) not in _CONVERT:
            raise HTTPException(
                status_code=422,
                detail=f"No conversion from '{item.unit}' to '{ing.base_unit}' for ingredient '{ing.name}'",
            )
        validated.append((item, ing))

    new_recipe = [
        RecipeIngredient(
            ingredient_id=PydanticObjectId(item.ingredient_id),
            quantity_per_100_guests=item.quantity_per_100_guests,
            unit=item.unit,
        )
        for item, _ in validated
    ]

    dish.recipe_ingredients = new_recipe
    dish.recipe_cost_per_plate = await _compute_recipe_cost(new_recipe)
    dish.updated_at = datetime.now(timezone.utc)
    await dish.save()

    # Build response using cached ingredients — no second DB round-trip
    items = []
    for ri, (_, ing) in zip(dish.recipe_ingredients, validated):
        qty_in_base = _to_base(ri.quantity_per_100_guests, ri.unit, ing.base_unit)
        cost = round((qty_in_base / 100) * ing.cost_per_unit, 4)
        items.append(RecipeIngredientResponse(
            ingredient_id=str(ri.ingredient_id),
            ingredient_name=ing.name,
            quantity_per_100_guests=ri.quantity_per_100_guests,
            unit=ri.unit,
            cost_per_plate=cost,
        ))

    return RecipeResponse(
        dish_id=dish_id,
        ingredients=items,
        recipe_cost_per_plate=dish.recipe_cost_per_plate,
    )


@router.delete("/{dish_id}/recipe", status_code=status.HTTP_204_NO_CONTENT)
async def clear_dish_recipe(
    dish_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    dish = await Dish.get(dish_id)
    if not dish or dish.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Dish not found")
    dish.recipe_ingredients = []
    dish.recipe_cost_per_plate = None
    dish.updated_at = datetime.now(timezone.utc)
    await dish.save()
