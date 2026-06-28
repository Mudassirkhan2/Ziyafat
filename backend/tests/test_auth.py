import pytest

from models.user import User


async def test_login_sets_cookies(client, owner_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "owner@test.com", "password": "Password123!"},
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies
    data = response.json()
    assert data["name"] == "Test Owner"
    assert data["role"] == "owner"


async def test_login_wrong_password(client, owner_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "owner@test.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


async def test_login_unknown_email(client):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@test.com", "password": "Password123!"},
    )
    assert response.status_code == 401


async def test_me_returns_current_user(client, owner_user):
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "owner@test.com", "password": "Password123!"},
    )
    assert login.status_code == 200
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "owner@test.com"


async def test_me_unauthenticated(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


async def test_logout_clears_cookies(client, owner_user):
    await client.post(
        "/api/v1/auth/login",
        json={"email": "owner@test.com", "password": "Password123!"},
    )
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    set_cookie_headers = response.headers.get_list("set-cookie")
    assert any("access_token=" in h and "Max-Age=0" in h for h in set_cookie_headers)
    assert any("refresh_token=" in h and "Max-Age=0" in h for h in set_cookie_headers)


async def test_login_inactive_user(client):
    from core.security import hash_password
    user = User(
        name="Inactive User",
        email="inactive@test.com",
        hashed_password=hash_password("Password123!"),
        role="viewer",
        is_active=False,
    )
    await user.insert()
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "inactive@test.com", "password": "Password123!"},
    )
    assert response.status_code == 401


async def test_refresh_issues_new_cookies(client, owner_user):
    await client.post(
        "/api/v1/auth/login",
        json={"email": "owner@test.com", "password": "Password123!"},
    )
    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 200
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies
    data = response.json()
    assert data["email"] == "owner@test.com"
