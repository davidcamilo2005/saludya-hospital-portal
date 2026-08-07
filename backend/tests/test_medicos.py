"""Pruebas de /api/v1/medicos: CRUD administrativo + listado público (HU-03, HU-13)."""


def test_listado_publico_solo_incluye_activos(client, db_session, medico, especialidad):
    from app.models import Medico

    inactivo = Medico(
        documento_identidad="9999999999",
        nombre="Inactivo",
        apellido="Doctor",
        is_active=False,
        especialidades=[especialidad],
    )
    db_session.add(inactivo)
    db_session.commit()

    resp = client.get("/api/v1/medicos")
    assert resp.status_code == 200
    documentos = [m["documento_identidad"] for m in resp.json()]
    assert medico.documento_identidad in documentos
    assert "9999999999" not in documentos


def test_obtener_medico_incluye_especialidades(client, medico):
    resp = client.get(f"/api/v1/medicos/{medico.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["especialidades"]) == 1
    assert data["especialidades"][0]["nombre"] == "Medicina General"


def test_crear_medico_como_admin(client, admin_headers, especialidad):
    resp = client.post(
        "/api/v1/medicos",
        json={
            "nombre": "Carlos",
            "apellido": "Gómez",
            "documento_identidad": "5555555555",
            "email": "carlos.gomez@test.com",
            "especialidad_ids": [especialidad.id],
        },
        headers=admin_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["nombre"] == "Carlos"


def test_crear_medico_sin_especialidades_devuelve_422(client, admin_headers):
    resp = client.post(
        "/api/v1/medicos",
        json={
            "nombre": "Carlos",
            "apellido": "Gómez",
            "documento_identidad": "5555555555",
            "especialidad_ids": [],
        },
        headers=admin_headers,
    )
    assert resp.status_code == 422


def test_crear_medico_con_especialidad_inexistente_devuelve_404(client, admin_headers):
    resp = client.post(
        "/api/v1/medicos",
        json={
            "nombre": "Carlos",
            "apellido": "Gómez",
            "documento_identidad": "5555555555",
            "especialidad_ids": [999],
        },
        headers=admin_headers,
    )
    assert resp.status_code == 404


def test_crear_medico_documento_duplicado(client, admin_headers, medico, especialidad):
    resp = client.post(
        "/api/v1/medicos",
        json={
            "nombre": "Otro",
            "apellido": "Doctor",
            "documento_identidad": medico.documento_identidad,
            "especialidad_ids": [especialidad.id],
        },
        headers=admin_headers,
    )
    assert resp.status_code == 409


def test_crear_medico_como_paciente_devuelve_403(client, paciente_headers, especialidad):
    resp = client.post(
        "/api/v1/medicos",
        json={
            "nombre": "Carlos",
            "apellido": "Gómez",
            "documento_identidad": "5555555555",
            "especialidad_ids": [especialidad.id],
        },
        headers=paciente_headers,
    )
    assert resp.status_code == 403


def test_actualizar_medico_cambia_especialidades(client, admin_headers, medico, otra_especialidad):
    resp = client.put(
        f"/api/v1/medicos/{medico.id}",
        json={"especialidad_ids": [otra_especialidad.id]},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    nombres = [e["nombre"] for e in resp.json()["especialidades"]]
    assert nombres == ["Cardiología"]


def test_desactivar_medico(client, admin_headers, medico):
    resp = client.delete(f"/api/v1/medicos/{medico.id}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False
