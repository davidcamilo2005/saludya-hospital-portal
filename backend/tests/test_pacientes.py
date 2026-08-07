"""Pruebas de /api/v1/pacientes: perfil propio + administración (HU-07, HU-16)."""


def test_obtener_mi_perfil(client, paciente_headers):
    resp = client.get("/api/v1/pacientes/me", headers=paciente_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["documento_identidad"] == "1111111111"
    assert data["usuario"]["email"] == "paciente@test.com"


def test_obtener_mi_perfil_como_admin_devuelve_403(client, admin_headers):
    resp = client.get("/api/v1/pacientes/me", headers=admin_headers)
    assert resp.status_code == 403


def test_actualizar_mi_perfil(client, paciente_headers):
    resp = client.put(
        "/api/v1/pacientes/me",
        json={"telefono": "+1 555 9999", "direccion": "Nueva dirección 456"},
        headers=paciente_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["telefono"] == "+1 555 9999"
    assert data["direccion"] == "Nueva dirección 456"


def test_listar_pacientes_como_admin(client, admin_headers, paciente_usuario):
    resp = client.get("/api/v1/pacientes", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_listar_pacientes_como_paciente_devuelve_403(client, paciente_headers):
    resp = client.get("/api/v1/pacientes", headers=paciente_headers)
    assert resp.status_code == 403


def test_obtener_paciente_por_id_como_admin(client, admin_headers, paciente_usuario):
    _, paciente = paciente_usuario
    resp = client.get(f"/api/v1/pacientes/{paciente.id}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == paciente.id


def test_obtener_paciente_inexistente_devuelve_404(client, admin_headers):
    resp = client.get("/api/v1/pacientes/999", headers=admin_headers)
    assert resp.status_code == 404


def test_desactivar_paciente_como_admin(client, admin_headers, paciente_usuario):
    _, paciente = paciente_usuario
    resp = client.patch(f"/api/v1/pacientes/{paciente.id}/desactivar", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["usuario"]["is_active"] is False


def test_paciente_desactivado_no_puede_iniciar_sesion(client, admin_headers, paciente_usuario):
    _, paciente = paciente_usuario
    client.patch(f"/api/v1/pacientes/{paciente.id}/desactivar", headers=admin_headers)

    resp = client.post(
        "/api/v1/auth/login", json={"email": "paciente@test.com", "password": "Paciente1234"}
    )
    assert resp.status_code == 401
