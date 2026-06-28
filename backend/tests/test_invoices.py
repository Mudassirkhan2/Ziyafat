from unittest.mock import patch

import pytest
from httpx import AsyncClient

from models.user import User
from tests.conftest import login_as


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _create_customer(client: AsyncClient, phone: str = "9200000001") -> str:
    resp = await client.post("/api/v1/customers", json={"name": "Invoice Customer", "phone": phone})
    assert resp.status_code == 201
    return resp.json()["id"]


async def _create_booking(client: AsyncClient, customer_id: str, title: str = "Invoice Booking") -> str:
    resp = await client.post("/api/v1/bookings", json={"customer_id": customer_id, "title": title})
    assert resp.status_code == 201
    return resp.json()["id"]


LINE_ITEMS = [
    {"label": "Biryani", "qty_per_plate": 1.0, "guest_count": 150, "unit_price": 200.0, "total": 30000.0},
]


async def _create_quotation(client: AsyncClient, booking_id: str) -> dict:
    resp = await client.post(
        "/api/v1/quotations",
        json={
            "booking_id": booking_id,
            "line_items": LINE_ITEMS,
            "subtotal": 30000.0,
            "discount": 0.0,
            "total": 30000.0,
        },
    )
    assert resp.status_code == 201
    return resp.json()


async def _create_invoice(client: AsyncClient, booking_id: str, **kwargs) -> dict:
    payload = {"booking_id": booking_id, "subtotal": 0.0, "discount": 0.0, "total": 0.0}
    payload.update(kwargs)
    resp = await client.post("/api/v1/invoices", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

async def test_create_invoice(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client)
    booking_id = await _create_booking(client, customer_id)

    data = await _create_invoice(client, booking_id, line_items=LINE_ITEMS, subtotal=30000.0, total=30000.0)
    assert data["booking_id"] == booking_id
    assert data["status"] == "draft"
    assert data["subtotal"] == 30000.0
    assert data["total"] == 30000.0
    assert len(data["line_items"]) == 1
    assert "id" in data


async def test_invoice_number_format(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000002")
    booking_id = await _create_booking(client, customer_id)

    data = await _create_invoice(client, booking_id)
    assert data["invoice_number"].startswith("INV-")
    parts = data["invoice_number"].split("-")
    assert len(parts) == 3
    assert parts[0] == "INV"
    assert len(parts[1]) == 4   # year
    assert len(parts[2]) == 3   # zero-padded seq


async def test_second_invoice_increments_sequence(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000003")
    booking_id = await _create_booking(client, customer_id)

    inv1 = await _create_invoice(client, booking_id)
    inv2 = await _create_invoice(client, booking_id)

    seq1 = int(inv1["invoice_number"].split("-")[2])
    seq2 = int(inv2["invoice_number"].split("-")[2])
    assert seq2 == seq1 + 1


async def test_create_invoice_from_quotation_copies_line_items(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000004")
    booking_id = await _create_booking(client, customer_id)
    quotation = await _create_quotation(client, booking_id)

    data = await _create_invoice(client, booking_id, quotation_id=quotation["id"])
    assert data["quotation_id"] == quotation["id"]
    assert len(data["line_items"]) == len(quotation["line_items"])
    assert data["line_items"][0]["label"] == quotation["line_items"][0]["label"]
    assert data["total"] == quotation["total"]


async def test_list_invoices(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000005")
    booking_id = await _create_booking(client, customer_id)
    await _create_invoice(client, booking_id)

    resp = await client.get("/api/v1/invoices")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


async def test_get_invoice(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000006")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_invoice(client, booking_id)

    resp = await client.get(f"/api/v1/invoices/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]
    assert resp.json()["invoice_number"] == created["invoice_number"]


async def test_update_draft_invoice(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000007")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_invoice(client, booking_id)

    resp = await client.patch(
        f"/api/v1/invoices/{created['id']}",
        json={"notes": "Updated note", "total": 5000.0},
    )
    assert resp.status_code == 200
    assert resp.json()["notes"] == "Updated note"
    assert resp.json()["total"] == 5000.0


async def test_cannot_update_line_items_on_non_draft(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000008")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_invoice(client, booking_id)

    # Mark as sent
    await client.patch(f"/api/v1/invoices/{created['id']}", json={"status": "sent"})

    resp = await client.patch(
        f"/api/v1/invoices/{created['id']}",
        json={"line_items": [{"label": "New", "qty_per_plate": 1.0, "guest_count": 10, "unit_price": 10.0, "total": 100.0}]},
    )
    assert resp.status_code == 400


async def test_delete_draft_invoice(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000009")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_invoice(client, booking_id)

    resp = await client.delete(f"/api/v1/invoices/{created['id']}")
    assert resp.status_code == 204


async def test_cannot_delete_non_draft_invoice(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000010")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_invoice(client, booking_id)

    await client.patch(f"/api/v1/invoices/{created['id']}", json={"status": "paid"})

    resp = await client.delete(f"/api/v1/invoices/{created['id']}")
    assert resp.status_code == 400


async def test_invoice_status_transitions(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000011")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_invoice(client, booking_id)

    sent = await client.patch(f"/api/v1/invoices/{created['id']}", json={"status": "sent"})
    assert sent.json()["status"] == "sent"

    paid = await client.patch(f"/api/v1/invoices/{created['id']}", json={"status": "paid"})
    assert paid.json()["status"] == "paid"


async def test_invoice_pdf(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    customer_id = await _create_customer(client, phone="9200000012")
    booking_id = await _create_booking(client, customer_id)
    created = await _create_invoice(client, booking_id)

    with patch("routers.invoices.render_pdf", return_value=b"%PDF-1.4 mock"):
        resp = await client.get(f"/api/v1/invoices/{created['id']}/pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/pdf")
