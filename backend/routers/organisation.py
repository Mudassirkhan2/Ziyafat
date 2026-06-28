import asyncio
from typing import Literal

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.organisation import Organisation, ReportHeaderConfig, StorefrontSection
from models.user import User, UserRole
from services.cloudinary_service import upload_image, extract_public_id, delete_image

router = APIRouter(prefix="/api/v1/organisation", tags=["organisation"])


class OrgResponse(BaseModel):
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
    primary_container: str
    on_primary_container: str
    secondary: str
    on_secondary: str
    secondary_container: str
    on_secondary_container: str
    report_header: ReportHeaderConfig
    storefront_sections: list[StorefrontSection]
    gstin: str | None
    website: str | None
    bank_account_name: str | None
    bank_account_number: str | None
    bank_ifsc: str | None
    bank_name: str | None
    default_payment_terms: str | None
    default_cancellation_policy: str | None
    default_service_charge_percentage: float
    default_tax_rate: float
    default_gratuity_percentage: float
    invoice_prefix: str
    social_links: dict
    setup_completed: bool


class ReportHeaderUpdateConfig(BaseModel):
    logo_alignment: Literal["left", "center", "right"] | None = None
    show_address: bool | None = None
    show_phone: bool | None = None
    show_email: bool | None = None
    show_tagline: bool | None = None


class OrgUpdateRequest(BaseModel):
    name: str | None = None
    slug: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    tagline: str | None = None
    primary: str | None = None
    on_primary: str | None = None
    primary_container: str | None = None
    on_primary_container: str | None = None
    secondary: str | None = None
    on_secondary: str | None = None
    secondary_container: str | None = None
    on_secondary_container: str | None = None
    report_header: ReportHeaderUpdateConfig | None = None
    storefront_sections: list[StorefrontSection] | None = None
    gstin: str | None = None
    website: str | None = None
    bank_account_name: str | None = None
    bank_account_number: str | None = None
    bank_ifsc: str | None = None
    bank_name: str | None = None
    default_payment_terms: str | None = None
    default_cancellation_policy: str | None = None
    default_service_charge_percentage: float | None = None
    default_tax_rate: float | None = None
    default_gratuity_percentage: float | None = None
    invoice_prefix: str | None = None
    social_links: dict | None = None
    setup_completed: bool | None = None


async def _get_org(current_user: User) -> Organisation:
    org = await Organisation.get(current_user.org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organisation not found")
    return org


@router.get("", response_model=OrgResponse)
async def get_organisation(current_user: User = Depends(get_current_user)):
    return await _get_org(current_user)


@router.patch("", response_model=OrgResponse)
async def update_organisation(
    body: OrgUpdateRequest, current_user: User = Depends(get_current_user)
):
    org = await _get_org(current_user)
    update_data = body.model_dump(exclude_none=True)

    if "report_header" in update_data:
        merged = org.report_header.model_dump()
        merged.update(update_data.pop("report_header"))
        org.report_header = ReportHeaderConfig(**merged)

    for field, value in update_data.items():
        setattr(org, field, value)

    await org.save()
    return org


@router.post("/logo", response_model=OrgResponse)
async def upload_org_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    org = await _get_org(current_user)
    file_bytes = await file.read()
    url = await asyncio.to_thread(upload_image, file_bytes, "ziyafat/org", f"{org.slug}-logo")
    org.logo_url = url
    await org.save()
    return org


@router.post("/banner", response_model=OrgResponse)
async def upload_org_banner(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    org = await _get_org(current_user)
    file_bytes = await file.read()
    url = await asyncio.to_thread(upload_image, file_bytes, "ziyafat/org", f"{org.slug}-banner")
    org.banner_url = url
    await org.save()
    return org


@router.delete("/logo", response_model=OrgResponse)
async def delete_org_logo(
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    org = await _get_org(current_user)
    if not org.logo_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No logo to remove")
    public_id = extract_public_id(org.logo_url)
    if public_id:
        await asyncio.to_thread(delete_image, public_id)
    org.logo_url = None
    await org.save()
    return org


@router.delete("/banner", response_model=OrgResponse)
async def delete_org_banner(
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    org = await _get_org(current_user)
    if not org.banner_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No banner to remove")
    public_id = extract_public_id(org.banner_url)
    if public_id:
        await asyncio.to_thread(delete_image, public_id)
    org.banner_url = None
    await org.save()
    return org
