async def test_ping_returns_ok(client):
    response = await client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


async def test_ping_requires_no_auth(client):
    response = await client.get("/api/v1/ping")
    assert response.status_code == 200
