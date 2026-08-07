"""Pruebas de /api/v1/dashboard: métricas administrativas (HU-12)."""

from tests.conftest import proximo_dia_habil


def test_dashboard_requiere_token(client):
    resp = client.get("/api/v1/dashboard/stats")
    assert resp.status_code == 401


def test_dashboard_requiere_rol_admin(client, paciente_headers):
    resp = client.get("/api/v1/dashboard/stats", headers=paciente_headers)
    assert resp.status_code == 403


def test_dashboard_estructura_de_respuesta(client, admin_headers):
    resp = client.get("/api/v1/dashboard/stats", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert set(data.keys()) == {
        "citas_hoy",
        "citas_pendientes",
        "citas_por_especialidad",
        "medicos_activos",
        "pacientes_registrados",
    }


def test_dashboard_refleja_citas_y_medicos_creados(
    client, admin_headers, paciente_headers, medico, especialidad
):
    client.post(
        "/api/v1/citas",
        json={
            "medico_id": medico.id,
            "especialidad_id": especialidad.id,
            "fecha": proximo_dia_habil().isoformat(),
            "hora": "09:00:00",
        },
        headers=paciente_headers,
    )

    resp = client.get("/api/v1/dashboard/stats", headers=admin_headers)
    data = resp.json()
    assert data["citas_pendientes"] == 1
    assert data["medicos_activos"] == 1
    assert data["citas_por_especialidad"].get("Medicina General") == 1
    assert data["pacientes_registrados"] == 1
