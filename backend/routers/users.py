import asyncio
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.user import User, UserRole
from core.security import hash_password, verify_password
from schemas.pagination import PaginatedResponse
from services.cloudinary_service import upload_image, extract_public_id, delete_image

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


_USER_SORT_FIELDS = {"name", "email", "role"}


@router.get("", response_model=PaginatedResponse[UserResponse])
async def list_users(
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="name"),
    sort_dir: str = Query(default="asc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in _USER_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(_USER_SORT_FIELDS)}")

    query_filter = {"org_id": current_user.org_id}
    if search:
        regex = {"$regex": search, "$options": "i"}
        query_filter["$or"] = [{"name": regex}, {"email": regex}]

    sort_str = f"+{sort_by}" if sort_dir == "asc" else f"-{sort_by}"
    skip = (page - 1) * page_size

    total = await User.find(query_filter).count()
    users = await User.find(query_filter).sort(sort_str).skip(skip).limit(page_size).to_list()

    return PaginatedResponse.build(
        items=[_user_response(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: CreateUserBody,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    existing = await User.find_one({"email": body.email, "org_id": current_user.org_id})
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")
    now = datetime.now(timezone.utc)
    user = User(
        org_id=current_user.org_id,
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role,
        created_at=now,
        updated_at=now,
    )
    await user.insert()
    return _user_response(user)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_my_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    file_bytes = await file.read()
    user_id = str(current_user.id)
    url = await asyncio.to_thread(upload_image, file_bytes, "ziyafat/users", user_id)
    current_user.avatar_url = url
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()
    return _user_response(current_user)


@router.delete("/me/avatar", response_model=UserResponse)
async def delete_my_avatar(current_user: User = Depends(get_current_user)):
    if not current_user.avatar_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No avatar to remove")
    public_id = extract_public_id(current_user.avatar_url)
    if public_id:
        await asyncio.to_thread(delete_image, public_id)
    current_user.avatar_url = None
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()
    return _user_response(current_user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    user = await User.get(user_id)
    if not user or user.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_response(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    body: UpdateUserBody,
    current_user: User = Depends(require_role(UserRole.owner)),
):
    user = await User.get(user_id)
    if not user or user.org_id != current_user.org_id:
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
    if not user or user.org_id != current_user.org_id:
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
    if not target_user or target_user.org_id != current_user.org_id:
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
