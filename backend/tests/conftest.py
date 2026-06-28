import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from beanie import init_beanie
from mongomock_motor import AsyncMongoMockClient

from models.user import User
from models.organisation import Organisation
from models.lead import Lead
from models.customer import Customer
from models.booking import Booking
from models.event import Event


@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    client = AsyncMongoMockClient()
    await init_beanie(
        database=client["test_ziyafat"],
        document_models=[User, Organisation, Lead, Customer, Booking, Event],
    )
    yield
    await User.get_motor_collection().drop()
    await Organisation.get_motor_collection().drop()
    await Lead.get_motor_collection().drop()
    await Customer.get_motor_collection().drop()
    await Booking.get_motor_collection().drop()
    await Event.get_motor_collection().drop()


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


@pytest_asyncio.fixture
async def manager_user():
    from core.security import hash_password
    user = User(
        name="Test Manager",
        email="manager@test.com",
        hashed_password=hash_password("Password123!"),
        role="manager",
    )
    await user.insert()
    return user


async def login_as(client: AsyncClient, email: str, password: str) -> AsyncClient:
    """Log in and return the same client (cookies are stored on it)."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return client
