import pytest
from core.security import hash_password
from models.user import User, UserRole
from models.organisation import Organisation


@pytest.fixture(autouse=True)
async def seed_data():
    org = Organisation(name="Test Caterers", slug="test-caterers")
    await org.insert()
    user = User(
        org_id=org.id,
        name="Owner",
        email="owner@test.com",
        hashed_password=hash_password("Password123!"),
        role=UserRole.owner,
    )
    await user.insert()


async def _login(client):
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "owner@test.com", "password": "Password123!"},
    )
    assert r.status_code == 200


async def test_get_organisation(client):
    await _login(client)
    response = await client.get("/api/v1/organisation")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Caterers"
    assert data["slug"] == "test-caterers"
    assert "primary" in data


async def test_get_organisation_unauthenticated(client):
    response = await client.get("/api/v1/organisation")
    assert response.status_code == 401


async def test_patch_organisation_updates_name(client):
    await _login(client)
    response = await client.patch(
        "/api/v1/organisation", json={"name": "Updated Caterers"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Caterers"


async def test_patch_organisation_updates_colors(client):
    await _login(client)
    response = await client.patch(
        "/api/v1/organisation", json={"primary": "#1d4ed8", "on_primary": "#ffffff"}
    )
    assert response.status_code == 200
    assert response.json()["primary"] == "#1d4ed8"
    assert response.json()["on_primary"] == "#ffffff"


async def test_patch_organisation_unauthenticated(client):
    response = await client.patch(
        "/api/v1/organisation", json={"name": "Hacked"}
    )
    assert response.status_code == 401


async def test_patch_persists_to_database(client):
    await _login(client)
    await client.patch("/api/v1/organisation", json={"name": "Persisted Name"})
    response = await client.get("/api/v1/organisation")
    assert response.status_code == 200
    assert response.json()["name"] == "Persisted Name"


async def test_patch_report_header_partial_update(client):
    await _login(client)
    # First set a known state
    await client.patch(
        "/api/v1/organisation",
        json={"report_header": {"show_address": True, "show_phone": True}},
    )
    # Now partially update — only show_address should change
    response = await client.patch(
        "/api/v1/organisation",
        json={"report_header": {"show_address": False}},
    )
    assert response.status_code == 200
    rh = response.json()["report_header"]
    assert rh["show_address"] is False
    assert rh["show_phone"] is True  # must NOT have reset to default


async def test_delete_logo_clears_url(client):
    from unittest.mock import patch as mock_patch
    await _login(client)
    org = await Organisation.find_one({})
    org.logo_url = "https://res.cloudinary.com/demo/image/upload/v1/ziyafat/org/test-logo.jpg"
    await org.save()

    with mock_patch("routers.organisation.delete_image") as mock_del:
        response = await client.delete("/api/v1/organisation/logo")
    assert response.status_code == 200
    assert response.json()["logo_url"] is None
    mock_del.assert_called_once_with("ziyafat/org/test-logo")


async def test_delete_logo_when_none_returns_400(client):
    await _login(client)
    response = await client.delete("/api/v1/organisation/logo")
    assert response.status_code == 400


async def test_delete_banner_clears_url(client):
    from unittest.mock import patch as mock_patch
    await _login(client)
    org = await Organisation.find_one({})
    org.banner_url = "https://res.cloudinary.com/demo/image/upload/v1/ziyafat/org/test-banner.jpg"
    await org.save()

    with mock_patch("routers.organisation.delete_image"):
        response = await client.delete("/api/v1/organisation/banner")
    assert response.status_code == 200
    assert response.json()["banner_url"] is None


async def test_delete_banner_when_none_returns_400(client):
    await _login(client)
    response = await client.delete("/api/v1/organisation/banner")
    assert response.status_code == 400
