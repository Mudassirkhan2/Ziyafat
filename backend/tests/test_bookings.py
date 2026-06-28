import pytest
from httpx import AsyncClient

from models.user import User
from tests.conftest import login_as


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _create_customer(client: AsyncClient, name: str = "Test Customer", phone: str = "9200000001") -> str:
    resp = await client.post(
        "/api/v1/customers",
        json={"name": name, "phone": phone},
    )
    assert resp.status_code == 201
    return resp.json()["id"]


async def _create_booking(client: AsyncClient, customer_id: str, title: str = "Test Booking") -> str:
    resp = await client.post(
        "/api/v1/bookings",
        json={"customer_id": customer_id, "title": title},
    )
    assert resp.status_code == 201
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# Booking tests
# ---------------------------------------------------------------------------

async def test_create_booking(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client)
    response = await client.post(
        "/api/v1/bookings",
        json={"customer_id": customer_id, "title": "Walima Dinner"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Walima Dinner"
    assert data["status"] == "confirmed"
    assert data["customer_id"] == customer_id


async def test_list_bookings(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000002")
    await _create_booking(client, customer_id, title="Listed Booking")

    response = await client.get("/api/v1/bookings")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    titles = [b["title"] for b in data]
    assert "Listed Booking" in titles


async def test_update_booking_status(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000003")
    booking_id = await _create_booking(client, customer_id, title="Status Update Booking")

    patch_resp = await client.patch(
        f"/api/v1/bookings/{booking_id}",
        json={"status": "in_progress"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "in_progress"


async def test_delete_booking(client: AsyncClient, manager_user: User, owner_user: User):
    # Create customer and booking as owner
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000004")
    booking_id = await _create_booking(client, customer_id, title="Delete Booking")

    # Delete as manager
    await login_as(client, "manager@test.com", "Password123!")
    del_resp = await client.delete(f"/api/v1/bookings/{booking_id}")
    assert del_resp.status_code == 204


# ---------------------------------------------------------------------------
# Event tests (nested under /api/v1/bookings/{id}/events)
# ---------------------------------------------------------------------------

async def test_create_event_for_booking(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000005")
    booking_id = await _create_booking(client, customer_id, title="Event Booking")

    response = await client.post(
        f"/api/v1/bookings/{booking_id}/events",
        json={
            "name": "Main Ceremony",
            "date": "2026-08-15",
            "guest_count": 100,
            "catering_model": "per_plate",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Main Ceremony"
    assert data["date"] == "2026-08-15"
    assert data["guest_count"] == 100
    assert data["catering_model"] == "per_plate"
    assert data["booking_id"] == booking_id


async def test_list_events(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000006")
    booking_id = await _create_booking(client, customer_id, title="List Events Booking")

    await client.post(
        f"/api/v1/bookings/{booking_id}/events",
        json={
            "name": "Sangeet Night",
            "date": "2026-09-01",
            "guest_count": 200,
            "catering_model": "chef_driven",
        },
    )

    response = await client.get(f"/api/v1/bookings/{booking_id}/events")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    names = [e["name"] for e in data]
    assert "Sangeet Night" in names


async def test_update_event(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000007")
    booking_id = await _create_booking(client, customer_id, title="Update Event Booking")

    event_resp = await client.post(
        f"/api/v1/bookings/{booking_id}/events",
        json={
            "name": "Baraat",
            "date": "2026-10-10",
            "guest_count": 300,
            "catering_model": "per_plate",
        },
    )
    assert event_resp.status_code == 201
    event_id = event_resp.json()["id"]

    patch_resp = await client.patch(
        f"/api/v1/bookings/{booking_id}/events/{event_id}",
        json={"venue": "Grand Hall"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["venue"] == "Grand Hall"


async def test_delete_event(client: AsyncClient, manager_user: User, owner_user: User):
    # Create booking + event as owner
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000008")
    booking_id = await _create_booking(client, customer_id, title="Delete Event Booking")

    event_resp = await client.post(
        f"/api/v1/bookings/{booking_id}/events",
        json={
            "name": "Farewell Dinner",
            "date": "2026-11-20",
            "guest_count": 50,
            "catering_model": "chef_driven",
        },
    )
    assert event_resp.status_code == 201
    event_id = event_resp.json()["id"]

    # Delete as manager
    await login_as(client, "manager@test.com", "Password123!")
    del_resp = await client.delete(f"/api/v1/bookings/{booking_id}/events/{event_id}")
    assert del_resp.status_code == 204
