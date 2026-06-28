import pytest
from httpx import AsyncClient

from models.user import User
from tests.conftest import login_as


async def test_create_lead(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    response = await client.post(
        "/api/v1/leads",
        json={
            "name": "Khalid Hussain",
            "phone": "9876543210",
            "event_type": "Wedding",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Khalid Hussain"
    assert data["phone"] == "9876543210"
    assert data["event_type"] == "Wedding"
    assert data["status"] == "new"


async def test_list_leads(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    # Create a lead first
    await client.post(
        "/api/v1/leads",
        json={"name": "Fatima Begum", "phone": "9000000001", "event_type": "Birthday"},
    )
    response = await client.get("/api/v1/leads")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    names = [lead["name"] for lead in data]
    assert "Fatima Begum" in names


async def test_filter_leads_by_status(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    # Create lead with status 'new'
    await client.post(
        "/api/v1/leads",
        json={"name": "New Lead", "phone": "9000000002", "event_type": "Wedding", "status": "new"},
    )
    # Create lead with status 'quoted'
    await client.post(
        "/api/v1/leads",
        json={"name": "Quoted Lead", "phone": "9000000003", "event_type": "Birthday", "status": "quoted"},
    )
    response = await client.get("/api/v1/leads?status=new")
    assert response.status_code == 200
    data = response.json()
    assert all(lead["status"] == "new" for lead in data)
    names = [lead["name"] for lead in data]
    assert "New Lead" in names
    assert "Quoted Lead" not in names


async def test_update_lead(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    create_resp = await client.post(
        "/api/v1/leads",
        json={"name": "Update Me", "phone": "9000000004", "event_type": "Reception"},
    )
    assert create_resp.status_code == 201
    lead_id = create_resp.json()["id"]

    patch_resp = await client.patch(
        f"/api/v1/leads/{lead_id}",
        json={"status": "quoted"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "quoted"


async def test_delete_lead_manager(client: AsyncClient, manager_user: User):
    from core.security import hash_password
    # Manager can delete leads (owner + manager allowed)
    await login_as(client, "manager@test.com", "Password123!")
    # First create a lead as manager
    create_resp = await client.post(
        "/api/v1/leads",
        json={"name": "Delete Me", "phone": "9000000005", "event_type": "Mehendi"},
    )
    assert create_resp.status_code == 201
    lead_id = create_resp.json()["id"]

    del_resp = await client.delete(f"/api/v1/leads/{lead_id}")
    assert del_resp.status_code == 204


async def test_delete_lead_viewer_forbidden(client: AsyncClient, owner_user: User):
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

    # Create a lead as owner first
    await login_as(client, "owner@test.com", "Password123!")
    create_resp = await client.post(
        "/api/v1/leads",
        json={"name": "Protected Lead", "phone": "9000000006", "event_type": "Birthday"},
    )
    assert create_resp.status_code == 201
    lead_id = create_resp.json()["id"]

    # Now login as viewer and attempt delete
    await login_as(client, "viewer@test.com", "Password123!")
    del_resp = await client.delete(f"/api/v1/leads/{lead_id}")
    assert del_resp.status_code == 403


async def test_convert_lead_to_customer(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    create_resp = await client.post(
        "/api/v1/leads",
        json={"name": "Convert Me", "phone": "9000000007", "event_type": "Anniversary"},
    )
    assert create_resp.status_code == 201
    lead_id = create_resp.json()["id"]

    convert_resp = await client.post(f"/api/v1/leads/{lead_id}/convert")
    assert convert_resp.status_code == 201
    data = convert_resp.json()
    assert data["name"] == "Convert Me"
    assert data["phone"] == "9000000007"

    # Lead status should now be 'won'
    lead_resp = await client.get(f"/api/v1/leads/{lead_id}")
    assert lead_resp.status_code == 200
    assert lead_resp.json()["status"] == "won"


async def test_convert_already_won_lead(client: AsyncClient, owner_user: User):
    await login_as(client, "owner@test.com", "Password123!")
    create_resp = await client.post(
        "/api/v1/leads",
        json={"name": "Double Convert", "phone": "9000000008", "event_type": "Reception"},
    )
    assert create_resp.status_code == 201
    lead_id = create_resp.json()["id"]

    first = await client.post(f"/api/v1/leads/{lead_id}/convert")
    assert first.status_code == 201

    second = await client.post(f"/api/v1/leads/{lead_id}/convert")
    assert second.status_code == 409
