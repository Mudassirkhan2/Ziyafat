from datetime import datetime, timezone
from enum import Enum
from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class UserRole(str, Enum):
    owner = "owner"
    manager = "manager"
    kitchen = "kitchen"
    viewer = "viewer"


class User(Document):
    org_id: PydanticObjectId
    name: str
    email: str
    hashed_password: str
    role: UserRole
    avatar_url: str | None = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("email", ASCENDING), ("org_id", ASCENDING)], unique=True),
        ]
