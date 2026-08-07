"""Fixtures compartidas de la suite Pytest.

Cada test corre contra una base SQLite en memoria creada y destruida por
test (aislamiento total, sin estado compartido entre pruebas), con
`get_db` sobreescrito vía `app.dependency_overrides`. Esto evita depender
de un PostgreSQL real para correr la suite (ver docs/fases/05-testing.md).
"""

from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models import Especialidad, Medico, Paciente, Usuario


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ---------------------------------------------------------
# Usuarios de prueba
# ---------------------------------------------------------


@pytest.fixture()
def admin_usuario(db_session):
    usuario = Usuario(
        email="admin@test.com",
        password_hash=hash_password("Admin1234"),
        nombre="Admin",
        apellido="Test",
        rol="administrador",
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture()
def admin_headers(admin_usuario):
    token = create_access_token(subject=str(admin_usuario.id), rol="administrador")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def paciente_usuario(db_session):
    usuario = Usuario(
        email="paciente@test.com",
        password_hash=hash_password("Paciente1234"),
        nombre="Paciente",
        apellido="Test",
        rol="paciente",
    )
    db_session.add(usuario)
    db_session.flush()
    paciente = Paciente(usuario_id=usuario.id, documento_identidad="1111111111", telefono="+1 555 0000")
    db_session.add(paciente)
    db_session.commit()
    db_session.refresh(usuario)
    db_session.refresh(paciente)
    return usuario, paciente


@pytest.fixture()
def paciente_headers(paciente_usuario):
    usuario, _ = paciente_usuario
    token = create_access_token(subject=str(usuario.id), rol="paciente")
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------
# Catálogo de prueba
# ---------------------------------------------------------


@pytest.fixture()
def especialidad(db_session):
    esp = Especialidad(nombre="Medicina General", descripcion="Atención primaria")
    db_session.add(esp)
    db_session.commit()
    db_session.refresh(esp)
    return esp


@pytest.fixture()
def otra_especialidad(db_session):
    esp = Especialidad(nombre="Cardiología", descripcion="Enfermedades del corazón")
    db_session.add(esp)
    db_session.commit()
    db_session.refresh(esp)
    return esp


@pytest.fixture()
def medico(db_session, especialidad):
    med = Medico(
        documento_identidad="2222222222",
        nombre="Laura",
        apellido="Martínez",
        email="laura@test.com",
        especialidades=[especialidad],
    )
    db_session.add(med)
    db_session.commit()
    db_session.refresh(med)
    return med


# ---------------------------------------------------------
# Utilidades de fecha (evitan domingos en las citas "válidas")
# ---------------------------------------------------------


def proximo_dia_habil(dias_adelante: int = 7) -> date:
    """Fecha futura que nunca cae en domingo (regla de negocio, Fase 1)."""
    fecha = date.today() + timedelta(days=dias_adelante)
    while fecha.weekday() == 6:  # 6 = domingo
        fecha += timedelta(days=1)
    return fecha


def proximo_domingo() -> date:
    fecha = date.today() + timedelta(days=1)
    while fecha.weekday() != 6:
        fecha += timedelta(days=1)
    return fecha
