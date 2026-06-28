import pytest
from httpx import AsyncClient

from models.user import User
from tests.conftest import login_as


async def test_list_users_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/users")
    assert response.status_code == 401


async def test_list_users_authenticated(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    response = await client.get("/api/v1/users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    emails = [u["email"] for u in data]
    assert "owner@test.com" in emails


async def test_create_user_owner_only(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    response = await client.post(
        "/api/v1/users",
        json={
            "name": "New Manager",
            "email": "newmanager@test.com",
            "password": "Password123!",
            "role": "manager",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newmanager@test.com"
    assert data["role"] == "manager"


async def test_create_user_manager_forbidden(client: AsyncClient, manager_user: User):
    await login_as(client, "manager@test.com", "Password123!")
    response = await client.post(
        "/api/v1/users",
        json={
            "name": "Another User",
            "email": "another@test.com",
            "password": "Password123!",
            "role": "viewer",
        },
    )
    assert response.status_code == 403


async def test_update_user_name(client: AsyncClient, owner_user: User, manager_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    user_id = str(manager_user.id)
    response = await client.patch(
        f"/api/v1/users/{user_id}",
        json={"name": "Renamed Manager"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Renamed Manager"


async def test_deactivate_user(client: AsyncClient, owner_user: User, manager_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    target_id = str(manager_user.id)
    response = await client.delete(f"/api/v1/users/{target_id}")
    # DELETE returns 204 No Content on success
    assert response.status_code == 204
    # Verify the user is now inactive
    updated = await User.get(target_id)
    assert updated is not None
    assert updated.is_active is False


async def test_cannot_deactivate_self(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    own_id = str(owner_user.id)
    response = await client.delete(f"/api/v1/users/{own_id}")
    assert response.status_code == 400


async def test_change_own_password(client: AsyncClient, manager_user: User):
    await login_as(client, "manager@test.com", "Password123!")
    user_id = str(manager_user.id)
    response = await client.patch(
        f"/api/v1/users/{user_id}/password",
        json={
            "current_password": "Password123!",
            "new_password": "NewPassword456!",
        },
    )
    # PATCH /password returns 204 No Content
    assert response.status_code == 204
