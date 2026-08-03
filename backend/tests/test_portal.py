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
    assert data["quotation"] is not None
    assert data["quotation"]["total"] == 35000


async def test_portal_no_quotation(client: AsyncClient, owner_user: User, org: Organisation):
    await login_as(client, "owner@test.com", "Password123!")
    r = await client.post("/api/v1/customers", json={"name": "Fatima", "phone": "9100000099"})
    customer_id = r.json()["id"]
    r = await client.post("/api/v1/bookings", json={"customer_id": customer_id, "title": "Mehndi Only"})
    booking_id = r.json()["id"]
    r = await client.get(f"/api/v1/bookings/{booking_id}")
    token = r.json()["portal_token"]

    await client.post("/api/v1/auth/logout")

    r = await client.get(f"/api/v1/portal/{token}")
    assert r.status_code == 200
    assert r.json()["quotation"] is None


async def test_portal_invalid_token(client: AsyncClient):
    r = await client.get("/api/v1/portal/invalid-token-xyz")
    assert r.status_code == 404


async def test_portal_sign_quotation(client: AsyncClient, owner_user: User, org: Organisation):
    token = await _setup_portal(client, owner_user, org)
    await client.post("/api/v1/auth/logout")

    r = await client.post(
        f"/api/v1/portal/{token}/sign",
        json={"signer_name": "Ahmed Ali"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["client_signature_status"] == "signed"
    assert data["signer_name"] == "Ahmed Ali"
    assert data["signed_date"] is not None


async def test_portal_sign_invalid_token(client: AsyncClient):
    r = await client.post("/api/v1/portal/bad-token/sign", json={"signer_name": "X"})
    assert r.status_code == 404


async def test_portal_sign_already_signed(client: AsyncClient, owner_user: User, org: Organisation):
    token = await _setup_portal(client, owner_user, org)
    await client.post("/api/v1/auth/logout")
    # Sign once
    await client.post(f"/api/v1/portal/{token}/sign", json={"signer_name": "Ahmed Ali"})
    # Sign again — should 409
    r = await client.post(f"/api/v1/portal/{token}/sign", json={"signer_name": "Ahmed Ali"})
    assert r.status_code == 409


async def test_portal_dietary_submission(client: AsyncClient, owner_user: User, org: Organisation):
    token = await _setup_portal(client, owner_user, org)

    # Create an event while still logged in
    await login_as(client, "owner@test.com", "Password123!")
    booking_r = await client.get("/api/v1/bookings")
    booking_id = booking_r.json()["items"][0]["id"]

    # Events are at POST /api/v1/bookings/{booking_id}/events
    event_r = await client.post(
        f"/api/v1/bookings/{booking_id}/events",
        json={
            "name": "Walima Ceremony",
            "date": "2026-12-01",
            "guest_count": 200,
            "catering_model": "per_plate",
        },
    )
    assert event_r.status_code == 201
    event_id = event_r.json()["id"]

    await client.post("/api/v1/auth/logout")

    r = await client.post(
        f"/api/v1/portal/{token}/dietary",
        json={"event_id": event_id, "notes": "3 guests gluten-free, 1 nut allergy"},
    )
    assert r.status_code == 200
    assert r.json()["client_dietary_notes"] == "3 guests gluten-free, 1 nut allergy"


async def test_portal_dietary_wrong_event(client: AsyncClient, owner_user: User, org: Organisation):
    """Event that belongs to a different booking cannot be updated via this portal token."""
    token = await _setup_portal(client, owner_user, org)

    # Create a SECOND booking with its own event
    await login_as(client, "owner@test.com", "Password123!")
    r = await client.post("/api/v1/customers", json={"name": "Zara", "phone": "9199999999"})
    cid = r.json()["id"]
    r = await client.post("/api/v1/bookings", json={"customer_id": cid, "title": "Other Booking"})
    other_booking_id = r.json()["id"]
    r = await client.post(
        f"/api/v1/bookings/{other_booking_id}/events",
        json={"name": "Other Event", "date": "2026-12-02", "guest_count": 50, "catering_model": "per_plate"},
    )
    other_event_id = r.json()["id"]
    await client.post("/api/v1/auth/logout")

    # Try to update the other booking's event via THIS portal token — should 404
    r = await client.post(
        f"/api/v1/portal/{token}/dietary",
        json={"event_id": other_event_id, "notes": "attempt"},
    )
    assert r.status_code == 404
