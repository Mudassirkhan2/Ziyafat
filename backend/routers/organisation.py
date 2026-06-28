import asyncio
from typing import Literal

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.organisation import Organisation, ReportHeaderConfig
from models.user import User, UserRole
from services.cloudinary_service import upload_image

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


async def _get_org() -> Organisation:
    org = await Organisation.find_one()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organisation not found")
    return org


@router.get("", response_model=OrgResponse)
async def get_organisation(_: User = Depends(get_current_user)):
    return await _get_org()


@router.patch("", response_model=OrgResponse)
async def update_organisation(
    body: OrgUpdateRequest, _: User = Depends(get_current_user)
):
    org = await _get_org()
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
    _: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    org = await _get_org()
    file_bytes = await file.read()
    url = await asyncio.to_thread(upload_image, file_bytes, "ziyafat/org", f"{org.slug}-logo")
    org.logo_url = url
    await org.save()
    return org


@router.post("/banner", response_model=OrgResponse)
async def upload_org_banner(
    file: UploadFile = File(...),
    _: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    org = await _get_org()
    file_bytes = await file.read()
    url = await asyncio.to_thread(upload_image, file_bytes, "ziyafat/org", f"{org.slug}-banner")
    org.banner_url = url
    await org.save()
    return org
