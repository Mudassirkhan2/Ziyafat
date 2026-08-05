import hashlib
import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from core.security import (
    JWTError,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from core.config import settings
from core.email import send_password_reset_email
from dependencies import get_current_user
from models.user import User
from models.password_reset import PasswordResetToken

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


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    user = await User.find_one(User.email == body.email.lower().strip())
    if user and user.is_active:
        await PasswordResetToken.find(PasswordResetToken.user_id == str(user.id)).delete()

        raw_token = os.urandom(32).hex()
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.reset_token_expire_minutes)

        await PasswordResetToken(
            user_id=str(user.id),
            token_hash=token_hash,
            expires_at=expires_at,
        ).insert()

        reset_url = f"{settings.frontend_url}/reset-password?token={raw_token}"
        await send_password_reset_email(user.email, reset_url)

    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    now = datetime.now(timezone.utc)

    record = await PasswordResetToken.find_one(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > now,
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link.")

    user = await User.get(record.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link.")

    user.hashed_password = hash_password(body.new_password)
    await user.save()

    record.used = True
    await record.save()

    return {"message": "Password reset successfully."}
