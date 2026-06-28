import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from beanie import init_beanie
from mongomock_motor import AsyncMongoMockClient

from models.user import User
from models.organisation import Organisation


@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    client = AsyncMongoMockClient()
    await init_beanie(
        database=client["test_ziyafat"],
        document_models=[User, Organisation],
    )
    yield
    await User.get_motor_collection().drop()
    await Organisation.get_motor_collection().drop()


@pytest_asyncio.fixture
async def client():
    from main import app
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def owner_user():
    from core.security import hash_password
    user = User(
        name="Test Owner",
        email="owner@test.com",
        hashed_password=hash_password("Password123!"),
        role="owner",
    )
    await user.insert()
    return user
