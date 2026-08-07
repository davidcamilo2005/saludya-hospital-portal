"""Pruebas de /api/v1/auth: registro, login y /me (HU-05, HU-06)."""


def _payload_registro(**overrides):
    base = {
        "email": "nuevo.paciente@test.com",
        "password": "Clave1234",
        "nombre": "Nuevo",
        "apellido": "Paciente",
        "documento_identidad": "3333333333",
        "telefono": "+1 555 1111",
    }
    base.update(overrides)
    return base


def test_registrar_paciente_exitoso(client):
    resp = client.post("/api/v1/auth/register", json=_payload_registro())
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "nuevo.paciente@test.com"
    assert data["rol"] == "paciente"
    assert "password" not in data
    assert "password_hash" not in data


def test_registrar_correo_duplicado(client):
    client.post("/api/v1/auth/register", json=_payload_registro())
    resp = client.post("/api/v1/auth/register", json=_payload_registro(documento_identidad="4444444444"))
    assert resp.status_code == 409


def test_registrar_documento_duplicado(client):
    client.post("/api/v1/auth/register", json=_payload_registro())
    resp = client.post(
        "/api/v1/auth/register",
        json=_payload_registro(email="otro@test.com"),
    )
    assert resp.status_code == 409


def test_registrar_password_sin_numero_es_rechazada(client):
    resp = client.post("/api/v1/auth/register", json=_payload_registro(password="SoloLetras"))
    assert resp.status_code == 422


def test_registrar_password_sin_letra_es_rechazada(client):
    resp = client.post("/api/v1/auth/register", json=_payload_registro(password="12345678"))
    assert resp.status_code == 422


def test_registrar_password_corta_es_rechazada(client):
    resp = client.post("/api/v1/auth/register", json=_payload_registro(password="Abc123"))
    assert resp.status_code == 422


def test_registrar_email_invalido_es_rechazado(client):
    resp = client.post("/api/v1/auth/register", json=_payload_registro(email="no-es-un-correo"))
    assert resp.status_code == 422


def test_login_exitoso(client):
    client.post("/api/v1/auth/register", json=_payload_registro())
    resp = client.post(
        "/api/v1/auth/login", json={"email": "nuevo.paciente@test.com", "password": "Clave1234"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["token_type"] == "bearer"
    assert data["rol"] == "paciente"
    assert data["access_token"]


def test_login_password_incorrecta(client):
    client.post("/api/v1/auth/register", json=_payload_registro())
    resp = client.post(
        "/api/v1/auth/login", json={"email": "nuevo.paciente@test.com", "password": "Incorrecta1"}
    )
    assert resp.status_code == 401


def test_login_usuario_inexistente(client):
    resp = client.post("/api/v1/auth/login", json={"email": "nadie@test.com", "password": "Clave1234"})
    assert resp.status_code == 401


def test_me_sin_token_devuelve_401(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_me_con_token_valido(client, paciente_headers):
    resp = client.get("/api/v1/auth/me", headers=paciente_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "paciente@test.com"


def test_me_con_token_invalido_devuelve_401(client):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer token-invalido"})
    assert resp.status_code == 401
