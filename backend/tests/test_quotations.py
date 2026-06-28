from unittest.mock import patch

import pytest
from httpx import AsyncClient

from models.user import User
from tests.conftest import login_as


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _create_customer(client: AsyncClient, phone: str = "9100000001") -> str:
    resp = await client.post("/api/v1/customers", json={"name": "Test Customer", "phone": phone})
    assert resp.status_code == 201
    return resp.json()["id"]


async def _create_booking(client: AsyncClient, customer_id: str, title: str = "Test Booking") -> str:
    resp = await client.post("/api/v1/bookings", json={"customer_id": customer_id, "title": title})
    assert resp.status_code == 201
    return resp.json()["id"]


LINE_ITEMS = [
    {"label": "Biryani", "qty_per_plate": 1.0, "guest_count": 100, "unit_price": 180.0, "total": 18000.0},
    {"label": "Raita",   "qty_per_plate": 1.0, "guest_count": 100, "unit_price": 30.0,  "total": 3000.0},
]


async def _create_quotation(client: AsyncClient, booking_id: str) -> dict:
    resp = await client.post(
        "/api/v1/quotations",
        json={
            "booking_id": booking_id,
            "line_items": LINE_ITEMS,
            "subtotal": 21000.0,
            "discount": 1000.0,
            "total": 20000.0,
            "notes": "Includes service",
            "valid_until": "2026-08-01",
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

async def test_create_quotation(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client)
    booking_id = await _create_booking(client, customer_id)

    data = await _create_quotation(client, booking_id)
    assert data["booking_id"] == booking_id
    assert data["version"] == 1
    assert data["status"] == "draft"
    assert data["subtotal"] == 21000.0
    assert data["discount"] == 1000.0
    assert data["total"] == 20000.0
    assert len(data["line_items"]) == 2
    assert data["valid_until"] == "2026-08-01"
    assert "id" in data


async def test_list_quotations(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000002")
    booking_id = await _create_booking(client, customer_id)
    await _create_quotation(client, booking_id)

    resp = await client.get("/api/v1/quotations")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1


async def test_list_filter_by_booking_id(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    c1 = await _create_customer(client, phone="9100000003")
    c2 = await _create_customer(client, phone="9100000004")
    b1 = await _create_booking(client, c1, "Booking A")
    b2 = await _create_booking(client, c2, "Booking B")
    await _create_quotation(client, b1)
    await _create_quotation(client, b2)

    resp = await client.get(f"/api/v1/quotations?booking_id={b1}")
    assert resp.status_code == 200
    data = resp.json()
    assert all(q["booking_id"] == b1 for q in data)


async def test_list_filter_by_status(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000005")
    booking_id = await _create_booking(client, customer_id)
    q = await _create_quotation(client, booking_id)

    # Mark as sent
    await client.patch(f"/api/v1/quotations/{q['id']}", json={"status": "sent"})

    resp = await client.get("/api/v1/quotations?status=sent")
    assert resp.status_code == 200
    assert all(x["status"] == "sent" for x in resp.json())


async def test_get_quotation(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000006")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_quotation(client, booking_id)

    resp = await client.get(f"/api/v1/quotations/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_update_draft_line_items(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000007")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_quotation(client, booking_id)

    new_items = [{"label": "Haleem", "qty_per_plate": 1.0, "guest_count": 200, "unit_price": 150.0, "total": 30000.0}]
    resp = await client.patch(
        f"/api/v1/quotations/{created['id']}",
        json={"line_items": new_items, "subtotal": 30000.0, "total": 30000.0},
    )
    assert resp.status_code == 200
    assert len(resp.json()["line_items"]) == 1
    assert resp.json()["line_items"][0]["label"] == "Haleem"


async def test_cannot_update_line_items_on_non_draft(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000008")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_quotation(client, booking_id)

    # Mark as sent
    await client.patch(f"/api/v1/quotations/{created['id']}", json={"status": "sent"})

    # Attempt to change line items — should fail
    resp = await client.patch(
        f"/api/v1/quotations/{created['id']}",
        json={"line_items": [{"label": "New Item", "qty_per_plate": 1.0, "guest_count": 100, "unit_price": 100.0, "total": 10000.0}]},
    )
    assert resp.status_code == 400


async def test_duplicate_quotation(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000009")
    booking_id = await _create_booking(client, customer_id)
    original = await _create_quotation(client, booking_id)

    resp = await client.post(f"/api/v1/quotations/{original['id']}/duplicate")
    assert resp.status_code == 201
    dup = resp.json()
    assert dup["version"] == 2
    assert dup["status"] == "draft"
    assert dup["booking_id"] == booking_id
    assert len(dup["line_items"]) == len(original["line_items"])
    assert dup["id"] != original["id"]


async def test_delete_draft_quotation(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000010")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_quotation(client, booking_id)

    resp = await client.delete(f"/api/v1/quotations/{created['id']}")
    assert resp.status_code == 204


async def test_cannot_delete_non_draft(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000011")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_quotation(client, booking_id)

    await client.patch(f"/api/v1/quotations/{created['id']}", json={"status": "sent"})

    resp = await client.delete(f"/api/v1/quotations/{created['id']}")
    assert resp.status_code == 400


async def test_quotation_pdf(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9100000012")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_quotation(client, booking_id)

    with patch("routers.quotations.render_pdf", return_value=b"%PDF-1.4 mock"):
        resp = await client.get(f"/api/v1/quotations/{created['id']}/pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/pdf")
