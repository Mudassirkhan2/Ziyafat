import pytest
from httpx import AsyncClient
from models.user import User
from models.organisation import Organisation
from tests.conftest import login_as


async def _setup_portal(client: AsyncClient, owner_user: User, org: Organisation):
    """Create customer → booking → quotation, return portal_token."""
    await login_as(client, "owner@test.com", "Password123!")

    # Create customer
    r = await client.post("/api/v1/customers", json={"name": "Ahmed Ali", "phone": "9100000001"})
    assert r.status_code == 201
    customer_id = r.json()["id"]

    # Create booking — portal_token is auto-generated and returned in detail endpoint
    r = await client.post("/api/v1/bookings", json={"customer_id": customer_id, "title": "Walima Dinner"})
    assert r.status_code == 201
    booking_id = r.json()["id"]

    # Fetch booking detail to get portal_token (not in list/create response)
    r = await client.get(f"/api/v1/bookings/{booking_id}")
    assert r.status_code == 200
    token = r.json()["portal_token"]

    # Create quotation for the booking
    r = await client.post("/api/v1/quotations", json={
        "booking_id": booking_id,
        "line_items": [{"label": "Biryani", "qty_per_plate": 1, "guest_count": 100, "unit_price": 350, "total": 35000}],
        "subtotal": 35000,
        "total": 35000,
    })
    assert r.status_code == 201

    return token


async def test_get_portal_data(client: AsyncClient, owner_user: User, org: Organisation):
    token = await _setup_portal(client, owner_user, org)

    # Portal is public — log out first
    await client.post("/api/v1/auth/logout")

    r = await client.get(f"/api/v1/portal/{token}")
    assert r.status_code == 200
    data = r.json()
    assert data["booking_title"] == "Walima Dinner"
    assert "org" in data
    assert data["org"]["name"] == "Test Caterers"
    assert "events" in data
    assert isinstance(data["events"], list)
    assert "quotation" in data


async def test_portal_invalid_token(client: AsyncClient):
    r = await client.get("/api/v1/portal/invalid-token-xyz")
    assert r.status_code == 404
