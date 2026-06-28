from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel
from core.security import (
    JWTError,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from core.config import settings
from dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

ACCESS_MAX_AGE = settings.access_token_expire_minutes * 60
REFRESH_MAX_AGE = settings.refresh_token_expire_days * 24 * 60 * 60


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_url: str | None


def _set_auth_cookies(response: Response, user_id: str) -> None:
    response.set_cookie(
        key="access_token",
        value=create_access_token(str(user_id)),
        httponly=True,
        max_age=ACCESS_MAX_AGE,
        samesite="lax",
    )
    response.set_cookie(
        key="refresh_token",
        value=create_refresh_token(str(user_id)),
        httponly=True,
        max_age=REFRESH_MAX_AGE,
        samesite="lax",
    )


@router.post("/login", response_model=UserResponse)
async def login(body: LoginRequest, response: Response):
    user = await User.find_one(User.email == body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account disabled")
    _set_auth_cookies(response, str(user.id))
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        avatar_url=user.avatar_url,
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", httponly=True, samesite="lax")
    response.delete_cookie("refresh_token", httponly=True, samesite="lax")
    return {"message": "Logged out"}


@router.post("/refresh", response_model=UserResponse)
async def refresh(response: Response, refresh_token: str | None = Cookie(default=None)):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = await User.get(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    _set_auth_cookies(response, str(user.id))
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        avatar_url=user.avatar_url,
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        avatar_url=current_user.avatar_url,
    )
