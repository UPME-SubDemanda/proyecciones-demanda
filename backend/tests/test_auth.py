def login(client, email):
    r = client.post("/api/v1/auth/login", json={"email": email, "password": "clave-123"})
    assert r.status_code == 200, r.text
    return r.json()


def test_health(client):
    assert client.get("/api/v1/health").json() == {"status": "ok"}


def test_me_requires_login(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_local_login_and_me(client):
    login(client, "viewer@local")
    assert client.get("/api/v1/auth/me").json()["roles"] == ["viewer"]


def test_wrong_password(client):
    r = client.post("/api/v1/auth/login", json={"email": "viewer@local", "password": "x"})
    assert r.status_code == 401


def test_admin_assigns_roles(client):
    login(client, "viewer@local")
    assert client.get("/api/v1/admin/users").status_code == 403
    client.post("/api/v1/auth/logout")
    login(client, "admin@local")
    users = client.get("/api/v1/admin/users").json()
    viewer = next(u for u in users if u["email"] == "viewer@local")
    r = client.put(f"/api/v1/admin/users/{viewer['id']}/roles", json={"roles": ["viewer", "modeler"]})
    assert sorted(r.json()["roles"]) == ["modeler", "viewer"]
