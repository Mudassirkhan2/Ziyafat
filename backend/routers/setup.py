import re
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, field_validator
from core.security import hash_password
from models.user import User, UserRole
from models.organisation import Organisation

router = APIRouter(prefix="/api/v1/setup", tags=["setup"])


class SetupRequest(BaseModel):
    org_name: str
    org_slug: str
    org_phone: str | None = None
    org_email: str | None = None
    org_address: str | None = None
    org_tagline: str | None = None
    owner_name: str
    owner_email: str
    owner_password: str
    primary: str = "#d97706"
    on_primary: str = "#0c0a09"
    primary_container: str = "#451a03"
    on_primary_container: str = "#fed7aa"
    secondary: str = "#f59e0b"
    on_secondary: str = "#0c0a09"
    secondary_container: str = "#78350f"
    on_secondary_container: str = "#fde68a"

    @field_validator("org_slug")
    @classmethod
    def slug_must_be_url_safe(cls, v: str) -> str:
        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError("slug must contain only lowercase letters, digits, and hyphens")
        if len(v) > 100:
            raise ValueError("slug must be 100 characters or fewer")
        return v

    @field_validator("owner_email")
    @classmethod
    def email_must_be_valid(cls, v: str) -> str:
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("owner_email must be a valid email address")
        return v

    @field_validator("owner_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("owner_password must be at least 8 characters")
        return v


@router.get("/status")
async def setup_status():
    return {"completed": False}


@router.post("", status_code=status.HTTP_201_CREATED)
async def run_setup(body: SetupRequest):
    if await Organisation.find_one(Organisation.slug == body.org_slug):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Organisation slug already taken")
    if await User.find_one(User.email == body.owner_email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    org = Organisation(
        name=body.org_name,
        slug=body.org_slug,
        phone=body.org_phone,
        email=body.org_email,
        address=body.org_address,
        tagline=body.org_tagline,
        primary=body.primary,
        on_primary=body.on_primary,
        primary_container=body.primary_container,
        on_primary_container=body.on_primary_container,
        secondary=body.secondary,
        on_secondary=body.on_secondary,
        secondary_container=body.secondary_container,
        on_secondary_container=body.on_secondary_container,
    )
    await org.insert()

    owner = User(
        org_id=org.id,
        name=body.owner_name,
        email=body.owner_email,
        hashed_password=hash_password(body.owner_password),
        role=UserRole.owner,
    )
    await owner.insert()

    return {
        "org": {"name": org.name, "slug": org.slug},
        "owner": {"email": owner.email, "role": owner.role.value},
    }
