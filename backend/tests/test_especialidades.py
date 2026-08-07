"""Pruebas de /api/v1/especialidades: CRUD administrativo + listado público (HU-02, HU-14)."""


def test_listado_publico_solo_incluye_activas(client, db_session, especialidad):
    from app.models import Especialidad

    inactiva = Especialidad(nombre="Inactiva", is_active=False)
    db_session.add(inactiva)
    db_session.commit()

    resp = client.get("/api/v1/especialidades")
    assert resp.status_code == 200
    nombres = [e["nombre"] for e in resp.json()]
    assert "Medicina General" in nombres
    assert "Inactiva" not in nombres


def test_obtener_especialidad_por_id(client, especialidad):
    resp = client.get(f"/api/v1/especialidades/{especialidad.id}")
    assert resp.status_code == 200
    assert resp.json()["nombre"] == "Medicina General"


def test_obtener_especialidad_inexistente_devuelve_404(client):
    resp = client.get("/api/v1/especialidades/999")
    assert resp.status_code == 404


def test_listar_todas_admin_requiere_rol_admin(client, paciente_headers):
    resp = client.get("/api/v1/especialidades/admin/todas", headers=paciente_headers)
    assert resp.status_code == 403


def test_listar_todas_admin_sin_token_devuelve_401(client):
    resp = client.get("/api/v1/especialidades/admin/todas")
    assert resp.status_code == 401


def test_crear_especialidad_como_admin(client, admin_headers):
    resp = client.post(
        "/api/v1/especialidades",
        json={"nombre": "Pediatría", "descripcion": "Atención infantil"},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["is_active"] is True


def test_crear_especialidad_nombre_duplicado(client, admin_headers, especialidad):
    resp = client.post(
        "/api/v1/especialidades",
        json={"nombre": especialidad.nombre},
        headers=admin_headers,
    )
    assert resp.status_code == 409


def test_crear_especialidad_como_paciente_devuelve_403(client, paciente_headers):
    resp = client.post("/api/v1/especialidades", json={"nombre": "Nueva"}, headers=paciente_headers)
    assert resp.status_code == 403


def test_actualizar_especialidad(client, admin_headers, especialidad):
    resp = client.put(
        f"/api/v1/especialidades/{especialidad.id}",
        json={"descripcion": "Descripción actualizada"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["descripcion"] == "Descripción actualizada"


def test_desactivar_especialidad_sin_medicos_asociados(client, admin_headers, otra_especialidad):
    resp = client.delete(f"/api/v1/especialidades/{otra_especialidad.id}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False


def test_desactivar_especialidad_con_medico_activo_devuelve_409(client, admin_headers, especialidad, medico):
    resp = client.delete(f"/api/v1/especialidades/{especialidad.id}", headers=admin_headers)
    assert resp.status_code == 409
