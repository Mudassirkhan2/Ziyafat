import pytest
from httpx import AsyncClient
from core.security import hash_password
from models.user import User, UserRole
from tests.conftest import login_as

_EMAIL = "owner@test.com"
_PW = "Password123!"


@pytest.fixture(autouse=True)
async def seed_owner():
    await User(
        name="Owner",
        email=_EMAIL,
        hashed_password=hash_password(_PW),
        role=UserRole.owner,
    ).insert()


async def test_create_and_list_ingredient(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    resp = await client.post(
        "/api/v1/ingredients",
        json={"name": "Basmati Rice", "base_unit": "kg", "cost_per_unit": 60.0, "supplier": "Reliance Fresh"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Basmati Rice"
    assert data["base_unit"] == "kg"

    list_resp = await client.get("/api/v1/ingredients")
    assert list_resp.status_code == 200
    assert any(i["name"] == "Basmati Rice" for i in list_resp.json())


async def test_invalid_base_unit_rejected(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    resp = await client.post(
        "/api/v1/ingredients",
        json={"name": "Onion", "base_unit": "handful", "cost_per_unit": 1.0},
    )
    assert resp.status_code == 422


async def test_get_ingredient(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    create = await client.post(
        "/api/v1/ingredients",
        json={"name": "Salt", "base_unit": "g", "cost_per_unit": 0.001},
    )
    ing_id = create.json()["id"]
    resp = await client.get(f"/api/v1/ingredients/{ing_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Salt"


async def test_patch_ingredient(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    create = await client.post(
        "/api/v1/ingredients",
        json={"name": "Oil", "base_unit": "L", "cost_per_unit": 120.0},
    )
    ing_id = create.json()["id"]
    patch = await client.patch(f"/api/v1/ingredients/{ing_id}", json={"cost_per_unit": 135.0})
    assert patch.status_code == 200
    assert patch.json()["cost_per_unit"] == 135.0

    get = await client.get(f"/api/v1/ingredients/{ing_id}")
    assert get.json()["cost_per_unit"] == 135.0


async def test_delete_soft_deactivates(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    create = await client.post(
        "/api/v1/ingredients",
        json={"name": "Turmeric", "base_unit": "g", "cost_per_unit": 0.5},
    )
    ing_id = create.json()["id"]
    del_resp = await client.delete(f"/api/v1/ingredients/{ing_id}")
    assert del_resp.status_code == 204

    list_resp = await client.get("/api/v1/ingredients")
    assert not any(i["id"] == ing_id for i in list_resp.json())


async def test_supplier_filter(client: AsyncClient):
    await login_as(client, _EMAIL, _PW)
    await client.post("/api/v1/ingredients", json={"name": "Ghee", "base_unit": "kg", "cost_per_unit": 500.0, "supplier": "Metro"})
    await client.post("/api/v1/ingredients", json={"name": "Butter", "base_unit": "kg", "cost_per_unit": 400.0, "supplier": "DMart"})
    resp = await client.get("/api/v1/ingredients?supplier=metro")
    names = [i["name"] for i in resp.json()]
    assert "Ghee" in names
    assert "Butter" not in names
