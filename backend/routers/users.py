from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.user import User, UserRole
from core.security import hash_password, verify_password

router = APIRouter(prefix="/api/v1/users", tags=["users"])


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CreateUserBody(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole


class UpdateUserBody(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    avatar_url: Optional[str] = None


class ChangePasswordBody(BaseModel):
    new_password: str
    current_password: Optional[str] = None


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get("", response_model=list[UserResponse])
async def list_users(current_user: User = Depends(get_current_user)):
    users = await User.find_all().to_list()
    return [_user_response(u) for u in users]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: CreateUserBody,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    existing = await User.find_one(User.email == body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")
    now = datetime.now(timezone.utc)
    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role,
        created_at=now,
        updated_at=now,
    )
    await user.insert()
    return _user_response(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_response(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    body: UpdateUserBody,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.name is not None:
        user.name = body.name
    if body.role is not None:
        user.role = body.role
    if body.avatar_url is not None:
        user.avatar_url = body.avatar_url
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
    return _user_response(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user(
    user_id: str,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    user.updated_at = datetime.now(timezone.utc)
    await user.save()


@router.patch("/{user_id}/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    user_id: str,
    body: ChangePasswordBody,
    current_user: User = Depends(get_current_user),
):
    is_owner = current_user.role == UserRole.owner
    is_self = str(current_user.id) == user_id

    if not is_owner and not is_self:
        raise HTTPException(status_code=403, detail="Cannot change another user's password")

    target_user = await User.get(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not is_owner:
        # Non-owner must supply current_password
        if not body.current_password:
            raise HTTPException(status_code=400, detail="current_password is required")
        if not verify_password(body.current_password, target_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

    target_user.hashed_password = hash_password(body.new_password)
    target_user.updated_at = datetime.now(timezone.utc)
    await target_user.save()
