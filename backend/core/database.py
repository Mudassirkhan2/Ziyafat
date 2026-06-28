from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    global _client
    from models.user import User
    from models.organisation import Organisation

    _client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=_client[settings.mongodb_db],
        document_models=[User, Organisation],
    )


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
