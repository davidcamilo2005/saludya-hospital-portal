"""Dependencias de FastAPI: sesión de BD, autenticación por rol e inyección de servicios."""

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.domain.exceptions import ForbiddenError, UnauthorizedError
from app.models import Usuario
from app.repositories import (
    SqlAlchemyCitaRepository,
    SqlAlchemyEspecialidadRepository,
    SqlAlchemyMedicoRepository,
    SqlAlchemyPacienteRepository,
    SqlAlchemyUsuarioRepository,
)
from app.services import (
    AuthService,
    CitaService,
    DashboardService,
    EspecialidadService,
    MedicoService,
    PacienteService,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login", auto_error=False)


# ---------------------------------------------------------
# Autenticación / autorización
# ---------------------------------------------------------


def get_current_usuario(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    if token is None:
        raise UnauthorizedError("No se proporcionó un token de autenticación")
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise UnauthorizedError(str(exc)) from exc

    usuario_id = payload.get("sub")
    usuario = SqlAlchemyUsuarioRepository(db).get_by_id(int(usuario_id)) if usuario_id else None
    if usuario is None or not usuario.is_active:
        raise UnauthorizedError("Usuario no encontrado o inactivo")
    return usuario


def require_admin(usuario: Usuario = Depends(get_current_usuario)) -> Usuario:
    if usuario.rol != "administrador":
        raise ForbiddenError("Esta acción requiere rol de administrador")
    return usuario


def require_paciente(usuario: Usuario = Depends(get_current_usuario)) -> Usuario:
    if usuario.rol != "paciente":
        raise ForbiddenError("Esta acción requiere rol de paciente")
    return usuario


# ---------------------------------------------------------
# Fábricas de servicios (inyección de dependencias)
# ---------------------------------------------------------


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(SqlAlchemyUsuarioRepository(db), SqlAlchemyPacienteRepository(db))


def get_paciente_service(db: Session = Depends(get_db)) -> PacienteService:
    return PacienteService(SqlAlchemyPacienteRepository(db))


def get_especialidad_service(db: Session = Depends(get_db)) -> EspecialidadService:
    return EspecialidadService(SqlAlchemyEspecialidadRepository(db))


def get_medico_service(db: Session = Depends(get_db)) -> MedicoService:
    return MedicoService(SqlAlchemyMedicoRepository(db))


def get_cita_service(db: Session = Depends(get_db)) -> CitaService:
    return CitaService(
        SqlAlchemyCitaRepository(db),
        SqlAlchemyMedicoRepository(db),
        SqlAlchemyEspecialidadRepository(db),
        hora_inicio=settings.APPOINTMENT_START_HOUR,
        hora_fin=settings.APPOINTMENT_END_HOUR,
    )


def get_dashboard_service(db: Session = Depends(get_db)) -> DashboardService:
    return DashboardService(
        SqlAlchemyCitaRepository(db), SqlAlchemyMedicoRepository(db), SqlAlchemyPacienteRepository(db)
    )
