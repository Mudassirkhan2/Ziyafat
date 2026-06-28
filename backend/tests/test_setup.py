async def test_setup_status_incomplete_when_no_users(client):
    response = await client.get("/api/v1/setup/status")
    assert response.status_code == 200
    assert response.json() == {"completed": False}


async def test_setup_creates_owner_and_organisation(client):
    response = await client.post(
        "/api/v1/setup",
        json={
            "org_name": "Al-Noor Caterers",
            "org_slug": "al-noor-caterers",
            "org_phone": "+919876543210",
            "org_email": "info@alnoor.com",
            "owner_name": "Ahmed Khan",
            "owner_email": "ahmed@alnoor.com",
            "owner_password": "SecurePass123!",
            "primary": "#1d4ed8",
            "on_primary": "#ffffff",
            "secondary": "#3b82f6",
            "on_secondary": "#ffffff",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["org"]["name"] == "Al-Noor Caterers"
    assert data["owner"]["email"] == "ahmed@alnoor.com"
    assert data["owner"]["role"] == "owner"
    assert "hashed_password" not in data["owner"]
    assert "password" not in data["owner"]


async def test_setup_status_complete_after_setup(client):
    setup = await client.post(
        "/api/v1/setup",
        json={
            "org_name": "Al-Noor Caterers",
            "org_slug": "al-noor",
            "owner_name": "Ahmed",
            "owner_email": "ahmed@test.com",
            "owner_password": "SecurePass123!",
        },
    )
    assert setup.status_code == 201
    response = await client.get("/api/v1/setup/status")
    assert response.json() == {"completed": True}


async def test_setup_blocked_if_already_done(client):
    await client.post(
        "/api/v1/setup",
        json={
            "org_name": "Al-Noor Caterers",
            "org_slug": "al-noor",
            "owner_name": "Ahmed",
            "owner_email": "ahmed@test.com",
            "owner_password": "SecurePass123!",
        },
    )
    response = await client.post(
        "/api/v1/setup",
        json={
            "org_name": "Another Org",
            "org_slug": "another",
            "owner_name": "Bob",
            "owner_email": "bob@test.com",
            "owner_password": "SecurePass123!",
        },
    )
    assert response.status_code == 409


async def test_setup_rejects_invalid_slug(client):
    response = await client.post(
        "/api/v1/setup",
        json={
            "org_name": "Test Org",
            "org_slug": "Invalid Slug!",
            "owner_name": "Test",
            "owner_email": "test@test.com",
            "owner_password": "SecurePass123!",
        },
    )
    assert response.status_code == 422
