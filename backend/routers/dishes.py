import asyncio
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.dish import Dish
from models.organisation import Organisation
from models.user import User, UserRole
from services.pdf_service import render_pdf


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
    created_at: datetime
    updated_at: datetime


class CreateDishBody(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    per_plate_cost: float
    selling_price: float
    is_veg: bool = True


class UpdateDishBody(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    per_plate_cost: Optional[float] = None
    selling_price: Optional[float] = None
    is_veg: Optional[bool] = None
    is_active: Optional[bool] = None


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
        created_at=dish.created_at,
        updated_at=dish.updated_at,
    )


@router.get("", response_model=list[DishResponse])
async def list_dishes(
    category: Optional[str] = None,
    is_veg: Optional[bool] = None,
    active_only: bool = True,
    current_user: User = Depends(get_current_user),
):
    query = {}
    if active_only:
        query["is_active"] = True
    if is_veg is not None:
        query["is_veg"] = is_veg

    dishes = await Dish.find(query).to_list()

    if category is not None:
        category_lower = category.lower()
        dishes = [d for d in dishes if category_lower in d.category.lower()]

    return [_dish_response(d) for d in dishes]


@router.post("", response_model=DishResponse, status_code=status.HTTP_201_CREATED)
async def create_dish(
    body: CreateDishBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    now = datetime.now(timezone.utc)
    dish = Dish(
        name=body.name,
        category=body.category,
        description=body.description,
        per_plate_cost=body.per_plate_cost,
        selling_price=body.selling_price,
        is_veg=body.is_veg,
        created_at=now,
        updated_at=now,
    )
    await dish.insert()
    return _dish_response(dish)


@router.get("/pdf")
async def get_dishes_pdf(current_user: User = Depends(get_current_user)):
    dishes = await Dish.find({"is_active": True}).to_list()
    org = await Organisation.find_one()
    if org is None:
        org = _org_fallback()

    grouped: dict[str, list] = {}
    for dish in dishes:
        grouped.setdefault(dish.category, []).append(dish)

    context = {
        "org": org,
        "grouped_dishes": grouped,
    }
    pdf_bytes = await asyncio.to_thread(render_pdf, "dish_list.html", context)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=dish-catalog.pdf"},
    )


@router.get("/{dish_id}", response_model=DishResponse)
async def get_dish(dish_id: str, current_user: User = Depends(get_current_user)):
    dish = await Dish.get(dish_id)
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    return _dish_response(dish)


@router.patch("/{dish_id}", response_model=DishResponse)
async def update_dish(
    dish_id: str,
    body: UpdateDishBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    dish = await Dish.get(dish_id)
    if not dish:
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

    dish.updated_at = datetime.now(timezone.utc)
    await dish.save()
    return _dish_response(dish)


@router.delete("/{dish_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dish(
    dish_id: str,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    dish = await Dish.get(dish_id)
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    dish.is_active = False
    dish.updated_at = datetime.now(timezone.utc)
    await dish.save()


@router.post("/{dish_id}/image", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def upload_dish_image(
    dish_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    raise HTTPException(status_code=501, detail="Image upload available in Plan 5")
