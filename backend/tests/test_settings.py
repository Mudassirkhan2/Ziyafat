from unittest.mock import patch

import pytest
from core.security import hash_password
from httpx import AsyncClient
from models.organisation import Organisation
from models.user import User, UserRole
from tests.conftest import login_as

_OWNER_EMAIL = "owner@test.com"
_OWNER_PASSWORD = "Password123!"

FAKE_PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100


@pytest.fixture(autouse=True)
async def seed_data():
    org = Organisation(name="Test Caterers", slug="test-caterers")
    await org.insert()
    user = User(
        org_id=org.id,
        name="Owner",
        email=_OWNER_EMAIL,
        hashed_password=hash_password(_OWNER_PASSWORD),
        role=UserRole.owner,
    )
    await user.insert()


async def test_get_organisation(client: AsyncClient):
    await login_as(client, _OWNER_EMAIL, _OWNER_PASSWORD)
    resp = await client.get("/api/v1/organisation")
    assert resp.status_code == 200
    data = resp.json()
    assert "name" in data
    assert "primary" in data
    assert "report_header" in data
    assert "storefront_sections" in data


async def test_update_account_fields(client: AsyncClient):
    await login_as(client, _OWNER_EMAIL, _OWNER_PASSWORD)
    resp = await client.patch(
        "/api/v1/organisation",
        json={"name": "My Caterers", "phone": "9000000001", "address": "Hyderabad"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "My Caterers"
    assert data["phone"] == "9000000001"
    assert data["address"] == "Hyderabad"
    # Verify persistence
    get_resp = await client.get("/api/v1/organisation")
    persisted = get_resp.json()
    assert persisted["name"] == "My Caterers"
    assert persisted["phone"] == "9000000001"


async def test_update_report_header(client: AsyncClient):
    await login_as(client, _OWNER_EMAIL, _OWNER_PASSWORD)
    resp = await client.patch(
        "/api/v1/organisation",
        json={"report_header": {"show_tagline": True, "logo_alignment": "center"}},
    )
    assert resp.status_code == 200
    rh = resp.json()["report_header"]
    assert rh["show_tagline"] is True
    assert rh["logo_alignment"] == "center"
    # Verify persistence
    get_resp = await client.get("/api/v1/organisation")
    persisted_rh = get_resp.json()["report_header"]
    assert persisted_rh["show_tagline"] is True
    assert persisted_rh["logo_alignment"] == "center"


async def test_update_storefront_sections(client: AsyncClient):
    await login_as(client, _OWNER_EMAIL, _OWNER_PASSWORD)
    sections = [
        {"type": "hero", "enabled": True, "order": 0, "config": {}},
        {"type": "dish_grid", "enabled": True, "order": 1, "config": {}},
        {"type": "about", "enabled": False, "order": 2, "config": {}},
    ]
    resp = await client.patch(
        "/api/v1/organisation",
        json={"storefront_sections": sections},
    )
    assert resp.status_code == 200
    assert len(resp.json()["storefront_sections"]) == 3
    assert resp.json()["storefront_sections"][2]["enabled"] is False
    assert resp.json()["storefront_sections"][0]["type"] == "hero"


async def test_upload_logo(client: AsyncClient):
    await login_as(client, _OWNER_EMAIL, _OWNER_PASSWORD)
    with patch(
        "routers.organisation.upload_image",
        return_value="https://res.cloudinary.com/test/logo.png",
    ):
        resp = await client.post(
            "/api/v1/organisation/logo",
            files={"file": ("logo.png", FAKE_PNG_BYTES, "image/png")},
        )
    assert resp.status_code == 200
    assert resp.json()["logo_url"] == "https://res.cloudinary.com/test/logo.png"


async def test_upload_banner(client: AsyncClient):
    await login_as(client, _OWNER_EMAIL, _OWNER_PASSWORD)
    with patch(
        "routers.organisation.upload_image",
        return_value="https://res.cloudinary.com/test/banner.png",
    ):
        resp = await client.post(
            "/api/v1/organisation/banner",
            files={"file": ("banner.png", FAKE_PNG_BYTES, "image/png")},
        )
    assert resp.status_code == 200
    assert resp.json()["banner_url"] == "https://res.cloudinary.com/test/banner.png"


async def test_upload_dish_image(client: AsyncClient):
    await login_as(client, _OWNER_EMAIL, _OWNER_PASSWORD)
    # Create a dish first
    dish_resp = await client.post(
        "/api/v1/dishes",
        json={
            "name": "Biryani",
            "category": "Main",
            "per_plate_cost": 100.0,
            "selling_price": 150.0,
        },
    )
    assert dish_resp.status_code == 201
    dish_id = dish_resp.json()["id"]

    with patch(
        "routers.dishes.upload_image",
        return_value="https://res.cloudinary.com/test/dish.png",
    ):
        resp = await client.post(
            f"/api/v1/dishes/{dish_id}/image",
            files={"file": ("dish.png", FAKE_PNG_BYTES, "image/png")},
        )
    assert resp.status_code == 200
    assert resp.json()["image_url"] == "https://res.cloudinary.com/test/dish.png"
