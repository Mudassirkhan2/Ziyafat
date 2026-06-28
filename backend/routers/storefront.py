from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.dish import Dish
from models.organisation import Organisation, ReportHeaderConfig, StorefrontSection


router = APIRouter(prefix="/api/v1/public", tags=["storefront"])


class PublicDish(BaseModel):
    id: str
    name: str
    category: str
    description: str | None
    selling_price: float
    per_plate_cost: float
    is_veg: bool
    image_url: str | None
    cuisine_type: str | None
    portion_size: str | None
    minimum_order_quantity: int | None


class PublicOrg(BaseModel):
    name: str
    slug: str
    logo_url: str | None
    banner_url: str | None
    address: str | None
    phone: str | None
    email: str | None
    tagline: str | None
    primary: str
    on_primary: str
    report_header: ReportHeaderConfig
    storefront_sections: list[StorefrontSection]


class StorefrontResponse(BaseModel):
    org: PublicOrg
    dishes: list[PublicDish]


@router.get("/storefront/{slug}", response_model=StorefrontResponse)
async def get_storefront(slug: str):
    org = await Organisation.find_one({"slug": slug})
    if not org:
        raise HTTPException(status_code=404, detail="Storefront not found")
    dishes = await Dish.find({"org_id": org.id, "is_active": True}).to_list()
    return StorefrontResponse(
        org=PublicOrg(
            name=org.name,
            slug=org.slug,
            logo_url=org.logo_url,
            banner_url=org.banner_url,
            address=org.address,
            phone=org.phone,
            email=org.email,
            tagline=org.tagline,
            primary=org.primary,
            on_primary=org.on_primary,
            report_header=org.report_header,
            storefront_sections=org.storefront_sections,
        ),
        dishes=[
            PublicDish(
                id=str(d.id),
                name=d.name,
                category=d.category,
                description=d.description,
                selling_price=d.selling_price,
                per_plate_cost=d.per_plate_cost,
                is_veg=d.is_veg,
                image_url=d.image_url,
                cuisine_type=d.cuisine_type,
                portion_size=d.portion_size,
                minimum_order_quantity=d.minimum_order_quantity,
            )
            for d in dishes
        ],
    )
