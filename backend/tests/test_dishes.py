import pytest
from httpx import AsyncClient

from models.user import User
from tests.conftest import login_as


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

DISH_MAIN = {
    "name": "Mutton Biryani",
    "category": "Main Course",
    "per_plate_cost": 120.0,
    "selling_price": 180.0,
    "is_veg": False,
}

DISH_DESSERT = {
    "name": "Double Ka Meetha",
    "category": "Dessert",
    "per_plate_cost": 50.0,
    "selling_price": 80.0,
    "is_veg": True,
}

DISH_VEG = {
    "name": "Paneer Tikka",
    "category": "Starters",
    "per_plate_cost": 90.0,
    "selling_price": 130.0,
    "is_veg": True,
}

DISH_NON_VEG = {
    "name": "Chicken 65",
    "category": "Starters",
    "per_plate_cost": 100.0,
    "selling_price": 150.0,
    "is_veg": False,
}


async def _create_dish(client: AsyncClient, payload: dict) -> dict:
    resp = await client.post("/api/v1/dishes", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


async def test_create_dish(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    response = await client.post("/api/v1/dishes", json=DISH_MAIN)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Mutton Biryani"
    assert data["category"] == "Main Course"
    assert data["per_plate_cost"] == 120.0
    assert data["selling_price"] == 180.0
    assert data["is_veg"] is False
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


async def test_list_dishes(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    await _create_dish(client, DISH_MAIN)
    await _create_dish(client, DISH_DESSERT)

    response = await client.get("/api/v1/dishes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    names = [d["name"] for d in data]
    assert "Mutton Biryani" in names
    assert "Double Ka Meetha" in names


async def test_get_dish(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    created = await _create_dish(client, DISH_MAIN)
    dish_id = created["id"]

    response = await client.get(f"/api/v1/dishes/{dish_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == dish_id
    assert data["name"] == "Mutton Biryani"


async def test_update_dish(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    created = await _create_dish(client, DISH_MAIN)
    dish_id = created["id"]

    response = await client.patch(
        f"/api/v1/dishes/{dish_id}",
        json={"name": "Hyderabadi Biryani", "selling_price": 200.0},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Hyderabadi Biryani"
    assert data["selling_price"] == 200.0
    # unchanged fields stay the same
    assert data["per_plate_cost"] == 120.0
    assert data["category"] == "Main Course"


async def test_soft_delete_dish(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    created = await _create_dish(client, DISH_MAIN)
    dish_id = created["id"]

    # Soft delete
    del_resp = await client.delete(f"/api/v1/dishes/{dish_id}")
    assert del_resp.status_code == 204

    # Default list (active_only=True) should no longer include this dish
    list_resp = await client.get("/api/v1/dishes")
    assert list_resp.status_code == 200
    ids = [d["id"] for d in list_resp.json()]
    assert dish_id not in ids


async def test_filter_by_category(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    await _create_dish(client, DISH_MAIN)     # category = "Main Course"
    await _create_dish(client, DISH_DESSERT)  # category = "Dessert"

    # Case-insensitive contains match on "main"
    response = await client.get("/api/v1/dishes?category=main")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Mutton Biryani"
    assert data[0]["category"] == "Main Course"


async def test_filter_by_is_veg(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    await _create_dish(client, DISH_VEG)      # is_veg = True
    await _create_dish(client, DISH_NON_VEG)  # is_veg = False

    response = await client.get("/api/v1/dishes?is_veg=true")
    assert response.status_code == 200
    data = response.json()
    assert all(d["is_veg"] is True for d in data)
    names = [d["name"] for d in data]
    assert "Paneer Tikka" in names
    assert "Chicken 65" not in names


async def test_filter_active_only_false(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    created = await _create_dish(client, DISH_MAIN)
    dish_id = created["id"]

    # Soft-delete the dish
    del_resp = await client.delete(f"/api/v1/dishes/{dish_id}")
    assert del_resp.status_code == 204

    # With active_only=false it should appear
    response = await client.get("/api/v1/dishes?active_only=false")
    assert response.status_code == 200
    ids = [d["id"] for d in response.json()]
    assert dish_id in ids


async def test_manager_cannot_delete(client: AsyncClient, owner_user: User, manager_user: User):
    # Owner creates the dish
    await login_as(client, "owner@test.com", "Password123!")
    created = await _create_dish(client, DISH_MAIN)
    dish_id = created["id"]

    # Manager attempts to delete — should get 403
    await login_as(client, "manager@test.com", "Password123!")
    del_resp = await client.delete(f"/api/v1/dishes/{dish_id}")
    assert del_resp.status_code == 403


async def test_viewer_cannot_create(client: AsyncClient, owner_user: User):
    from core.security import hash_password
    from models.user import User as UserModel

    # Create a viewer user
    viewer = UserModel(
        name="Viewer User",
        email="viewer@test.com",
        hashed_password=hash_password("Password123!"),
        role="viewer",
    )
    await viewer.insert()

    await login_as(client, "viewer@test.com", "Password123!")
    response = await client.post("/api/v1/dishes", json=DISH_MAIN)
    assert response.status_code == 403


async def test_dishes_pdf(client: AsyncClient, owner_user: User):
    from unittest.mock import patch

    await login_as(client, "owner@test.com", "Password123!")
    await _create_dish(client, DISH_MAIN)

    with patch("routers.dishes.render_pdf", return_value=b"%PDF-1.4 mock"):
        response = await client.get("/api/v1/dishes/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")


async def test_dish_image_stub(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    created = await _create_dish(client, DISH_MAIN)
    dish_id = created["id"]

    response = await client.post(f"/api/v1/dishes/{dish_id}/image")
    assert response.status_code == 501
