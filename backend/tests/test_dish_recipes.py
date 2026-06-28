import pytest
from httpx import AsyncClient
from core.security import hash_password
from models.user import User, UserRole
from tests.conftest import login_as

_EMAIL = "owner@test.com"
_PW = "Password123!"


@pytest.fixture(autouse=True)
async def seed():
    from models.organisation import Organisation
    org = Organisation(name="Test Caterers", slug="test-caterers")
    await org.insert()
    await User(
        org_id=org.id,
        name="Owner",
        email=_EMAIL,
        hashed_password=hash_password(_PW),
        role=UserRole.owner,
    ).insert()


async def _create_ingredient(client, name="Rice", base_unit="kg", cost=60.0):
    r = await client.post("/api/v1/ingredients", json={"name": name, "base_unit": base_unit, "cost_per_unit": cost})
    return r.json()["id"]


async def _create_dish(client, name="Biryani"):
    r = await client.post(
        "/api/v1/dishes",
        json={"name": name, "category": "Main", "per_plate_cost": 100.0, "selling_price": 150.0},
    )
    return r.json()["id"]


async def test_put_and_get_recipe(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    ing_id = await _create_ingredient(client, "Rice", "kg", 60.0)
    dish_id = await _create_dish(client)

    put = await client.put(
        f"/api/v1/dishes/{dish_id}/recipe",
        json={"ingredients": [{"ingredient_id": ing_id, "quantity_per_100_guests": 5.0, "unit": "kg"}]},
    )
    assert put.status_code == 200
    recipe = put.json()
    assert len(recipe["ingredients"]) == 1
    assert recipe["ingredients"][0]["ingredient_name"] == "Rice"
    assert abs(recipe["recipe_cost_per_plate"] - 3.0) < 0.01


async def test_recipe_cost_with_unit_conversion(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    ing_id = await _create_ingredient(client, "Rice", "kg", 60.0)
    dish_id = await _create_dish(client, "Plain Rice")

    put = await client.put(
        f"/api/v1/dishes/{dish_id}/recipe",
        json={"ingredients": [{"ingredient_id": ing_id, "quantity_per_100_guests": 5000.0, "unit": "g"}]},
    )
    assert put.status_code == 200
    assert abs(put.json()["recipe_cost_per_plate"] - 3.0) < 0.01


async def test_dish_response_has_recipe_fields(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    ing_id = await _create_ingredient(client)
    dish_id = await _create_dish(client)

    dish = (await client.get(f"/api/v1/dishes/{dish_id}")).json()
    assert dish["has_recipe"] is False
    assert dish["recipe_cost_per_plate"] is None

    await client.put(
        f"/api/v1/dishes/{dish_id}/recipe",
        json={"ingredients": [{"ingredient_id": ing_id, "quantity_per_100_guests": 3.0, "unit": "kg"}]},
    )
    dish = (await client.get(f"/api/v1/dishes/{dish_id}")).json()
    assert dish["has_recipe"] is True
    assert dish["recipe_cost_per_plate"] is not None


async def test_clear_recipe(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    ing_id = await _create_ingredient(client)
    dish_id = await _create_dish(client)

    await client.put(
        f"/api/v1/dishes/{dish_id}/recipe",
        json={"ingredients": [{"ingredient_id": ing_id, "quantity_per_100_guests": 3.0, "unit": "kg"}]},
    )
    del_resp = await client.delete(f"/api/v1/dishes/{dish_id}/recipe")
    assert del_resp.status_code == 204

    get = (await client.get(f"/api/v1/dishes/{dish_id}/recipe")).json()
    assert get["ingredients"] == []
    assert get["recipe_cost_per_plate"] == 0.0


async def test_invalid_ingredient_id_rejected(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    dish_id = await _create_dish(client)
    resp = await client.put(
        f"/api/v1/dishes/{dish_id}/recipe",
        json={"ingredients": [{"ingredient_id": "000000000000000000000000", "quantity_per_100_guests": 1.0, "unit": "kg"}]},
    )
    assert resp.status_code == 422


async def test_invalid_unit_rejected(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    ing_id = await _create_ingredient(client)
    dish_id = await _create_dish(client)
    resp = await client.put(
        f"/api/v1/dishes/{dish_id}/recipe",
        json={"ingredients": [{"ingredient_id": ing_id, "quantity_per_100_guests": 1.0, "unit": "handful"}]},
    )
    assert resp.status_code == 422
