import pytest
from httpx import AsyncClient
from core.security import hash_password
from models.user import User, UserRole
from models.customer import Customer
from models.booking import Booking
from tests.conftest import login_as

_EMAIL = "owner@test.com"
_PW = "Password123!"


@pytest.fixture(autouse=True)
async def seed():
    await User(name="Owner", email=_EMAIL, hashed_password=hash_password(_PW), role=UserRole.owner).insert()


async def _setup(client):
    """Creates ingredient → dish with recipe → customer → booking → event → assigns menu."""
    ing = await client.post("/api/v1/ingredients", json={"name": "Basmati Rice", "base_unit": "kg", "cost_per_unit": 60.0, "supplier": "Wholesale"})
    ing_id = ing.json()["id"]

    dish = await client.post("/api/v1/dishes", json={"name": "Biryani", "category": "Main", "per_plate_cost": 100.0, "selling_price": 150.0})
    dish_id = dish.json()["id"]
    await client.put(
        f"/api/v1/dishes/{dish_id}/recipe",
        json={"ingredients": [{"ingredient_id": ing_id, "quantity_per_100_guests": 5.0, "unit": "kg"}]},
    )

    customer = await Customer(name="Test", phone="9000000001").insert()
    booking = await Booking(customer=customer, title="Wedding").insert()

    event = await client.post(
        f"/api/v1/bookings/{booking.id}/events",
        json={"name": "Nikaah", "date": "2026-12-15", "venue": "Hall", "guest_count": 200, "catering_model": "chef_driven"},
    )
    event_id = event.json()["id"]
    booking_id = str(booking.id)

    await client.patch(
        f"/api/v1/bookings/{booking_id}/events/{event_id}",
        json={"menu_dish_ids": [dish_id]},
    )

    return booking_id, event_id, dish_id, ing_id


async def test_procurement_aggregates_correctly(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    booking_id, event_id, _, _ = await _setup(client)

    resp = await client.get(f"/api/v1/bookings/{booking_id}/events/{event_id}/procurement")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 1
    assert items[0]["name"] == "Basmati Rice"
    assert abs(items[0]["quantity"] - 10.0) < 0.01   # 200 guests → 5kg*2=10kg
    assert items[0]["unit"] == "kg"
    assert abs(items[0]["cost"] - 600.0) < 0.01       # 10kg * ₹60
    assert items[0]["supplier"] == "Wholesale"


async def test_procurement_wastage_buffer(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    booking_id, event_id, _, _ = await _setup(client)

    resp = await client.get(f"/api/v1/bookings/{booking_id}/events/{event_id}/procurement?wastage_pct=10")
    assert resp.status_code == 200
    assert abs(resp.json()[0]["quantity"] - 11.0) < 0.01   # 10kg + 10%


async def test_procurement_empty_when_no_menu(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    customer = await Customer(name="C", phone="9999999999").insert()
    booking = await Booking(customer=customer, title="B").insert()
    event = await client.post(
        f"/api/v1/bookings/{booking.id}/events",
        json={"name": "E", "date": "2026-11-01", "venue": "V", "guest_count": 100, "catering_model": "chef_driven"},
    )
    resp = await client.get(f"/api/v1/bookings/{booking.id}/events/{event.json()['id']}/procurement")
    assert resp.status_code == 200
    assert resp.json() == []


async def test_procurement_pdf_returns_pdf(client: AsyncClient):
    from unittest.mock import patch

    await login_as(client, _EMAIL, _PW)
    booking_id, event_id, _, _ = await _setup(client)

    with patch("routers.events.render_pdf", return_value=b"%PDF-1.4 mock"):
        resp = await client.get(f"/api/v1/bookings/{booking_id}/events/{event_id}/procurement/pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"


async def test_menu_dish_ids_persisted(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    booking_id, event_id, dish_id, _ = await _setup(client)

    get = await client.get(f"/api/v1/bookings/{booking_id}/events/{event_id}")
    assert dish_id in get.json()["menu_dish_ids"]
