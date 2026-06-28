import re

from fastapi import HTTPException


def _get_cloudinary():
    """Lazy import + configure cloudinary. Raises 503 if not configured."""
    import cloudinary
    import cloudinary.uploader
    from core.config import settings

    if not settings.cloudinary_cloud_name:
        raise HTTPException(
            status_code=503,
            detail="Image uploads not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
        )
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
    return cloudinary.uploader


def upload_image(file_bytes: bytes, folder: str, public_id: str) -> str:
    """Upload bytes to Cloudinary and return the secure URL."""
    uploader = _get_cloudinary()
    result = uploader.upload(
        file_bytes,
        folder=folder,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    return result["secure_url"]


def extract_public_id(url: str | None) -> str | None:
    """Parse Cloudinary public_id from a secure URL, stripping version prefix and file extension."""
    if not url:
        return None
    match = re.search(r"/upload/(?:v\d+/)?(.+?)(?:\.[a-zA-Z]{2,5})?$", url)
    return match.group(1) if match else None


def delete_image(public_id: str) -> None:
    """Delete a Cloudinary asset and invalidate its CDN cache."""
    uploader = _get_cloudinary()
    uploader.destroy(public_id, invalidate=True, resource_type="image")
