import asyncio
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.user import User, UserRole
from services.cloudinary_service import upload_image

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class UploadResponse(BaseModel):
    url: str
    public_id: str


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    folder: str = "ziyafat/uploads",
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File type not supported. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 10 MB limit",
        )

    public_id = f"{folder}/{file.filename or 'upload'}"
    url = await asyncio.to_thread(upload_image, file_bytes, folder, public_id)
    return UploadResponse(url=url, public_id=public_id)
