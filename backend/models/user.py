from datetime import datetime, timezone
from enum import Enum
from beanie import Document
from pydantic import Field


class UserRole(str, Enum):
    owner = "owner"
    manager = "manager"
    kitchen = "kitchen"
    viewer = "viewer"


class User(Document):
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
        indexes = ["email"]
