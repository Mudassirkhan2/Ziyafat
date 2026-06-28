import pytest
from datetime import datetime, timezone
from httpx import AsyncClient
from models.dish import Dish
from models.organisation import Organisation


@pytest.fixture(autouse=True)
async def seed_storefront():
    org = Organisation(
        name="Tasty Caterers",
        slug="tasty-caterers",
        tagline="Best food in town",
        address="123 Banjara Hills",
        phone="9000000001",
    )
    await org.insert()
    dish = Dish(
        name="Biryani",
        category="Main Course",
        per_plate_cost=120.0,
        selling_price=180.0,
        is_veg=False,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    await dish.insert()
    inactive = Dish(
        name="Hidden Dish",
        category="Main Course",
        per_plate_cost=50.0,
        selling_price=80.0,
        is_veg=True,
        is_active=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    await inactive.insert()


async def test_storefront_returns_org_and_dishes(client: AsyncClient):
    resp = await client.get("/api/v1/public/storefront/tasty-caterers")
    assert resp.status_code == 200
    data = resp.json()
    assert data["org"]["name"] == "Tasty Caterers"
    assert data["org"]["slug"] == "tasty-caterers"
    assert data["org"]["tagline"] == "Best food in town"
    assert len(data["dishes"]) == 1
    assert data["dishes"][0]["name"] == "Biryani"


async def test_storefront_only_shows_active_dishes(client: AsyncClient):
    resp = await client.get("/api/v1/public/storefront/tasty-caterers")
    assert resp.status_code == 200
    names = [d["name"] for d in resp.json()["dishes"]]
    assert "Hidden Dish" not in names


async def test_storefront_404_for_unknown_slug(client: AsyncClient):
    resp = await client.get("/api/v1/public/storefront/does-not-exist")
    assert resp.status_code == 404


async def test_storefront_no_auth_required(client: AsyncClient):
    resp = await client.get("/api/v1/public/storefront/tasty-caterers")
    assert resp.status_code == 200


async def test_storefront_dish_fields(client: AsyncClient):
    resp = await client.get("/api/v1/public/storefront/tasty-caterers")
    dish = resp.json()["dishes"][0]
    assert "id" in dish
    assert "name" in dish
    assert "category" in dish
    assert "selling_price" in dish
    assert "is_veg" in dish
    # per_plate_cost must NOT be exposed publicly
    assert "per_plate_cost" not in dish
