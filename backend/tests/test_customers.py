import pytest
from datetime import datetime, timezone
from httpx import AsyncClient

from models.user import User
from models.customer import Customer
from models.booking import Booking
from tests.conftest import login_as


async def test_create_customer(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    response = await client.post(
        "/api/v1/customers",
        json={"name": "Salma Bibi", "phone": "9100000001"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Salma Bibi"
    assert data["phone"] == "9100000001"


async def test_list_customers(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    await client.post(
        "/api/v1/customers",
        json={"name": "List Customer", "phone": "9100000002"},
    )
    response = await client.get("/api/v1/customers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


async def test_search_customers(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    # Create Ahmed Ali
    await client.post(
        "/api/v1/customers",
        json={"name": "Ahmed Ali", "phone": "9100000003"},
    )
    # Create someone else
    await client.post(
        "/api/v1/customers",
        json={"name": "Zahida Bano", "phone": "9100000004"},
    )

    response = await client.get("/api/v1/customers?search=ahmed")
    assert response.status_code == 200
    data = response.json()
    names = [c["name"] for c in data]
    assert "Ahmed Ali" in names
    assert "Zahida Bano" not in names


async def test_update_customer(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    create_resp = await client.post(
        "/api/v1/customers",
        json={"name": "Update Customer", "phone": "9100000005"},
    )
    assert create_resp.status_code == 201
    customer_id = create_resp.json()["id"]

    patch_resp = await client.patch(
        f"/api/v1/customers/{customer_id}",
        json={"notes": "VIP"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["notes"] == "VIP"


async def test_delete_customer(client: AsyncClient, manager_user: User):
    await login_as(client, "manager@test.com", "Password123!")
    create_resp = await client.post(
        "/api/v1/customers",
        json={"name": "Delete Customer", "phone": "9100000006"},
    )
    assert create_resp.status_code == 201
    customer_id = create_resp.json()["id"]

    del_resp = await client.delete(f"/api/v1/customers/{customer_id}")
    assert del_resp.status_code == 204


async def test_get_customer_bookings(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")

    # Create a customer
    cust_resp = await client.post(
        "/api/v1/customers",
        json={"name": "Booking Customer", "phone": "9100000007"},
    )
    assert cust_resp.status_code == 201
    customer_id = cust_resp.json()["id"]

    # Create a booking for this customer
    booking_resp = await client.post(
        "/api/v1/bookings",
        json={"customer_id": customer_id, "title": "Wedding Catering"},
    )
    assert booking_resp.status_code == 201

    # Get bookings for customer
    response = await client.get(f"/api/v1/customers/{customer_id}/bookings")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    titles = [b["title"] for b in data]
    assert "Wedding Catering" in titles
