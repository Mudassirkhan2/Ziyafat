from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    global _client
    from models.user import User
    from models.organisation import Organisation
    from models.lead import Lead
    from models.customer import Customer
    from models.booking import Booking
    from models.event import Event
    from models.dish import Dish
    from models.quotation import Quotation
    from models.invoice import Invoice
    from models.ingredient import Ingredient

    _client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=_client[settings.mongodb_db],
        document_models=[User, Organisation, Lead, Customer, Booking, Event, Dish, Quotation, Invoice, Ingredient],
    )


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
