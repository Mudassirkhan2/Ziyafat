from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/ping")
async def ping() -> dict[str, bool]:
    return {"ok": True}
