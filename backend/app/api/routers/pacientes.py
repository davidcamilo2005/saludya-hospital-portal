"""Endpoints del módulo paciente (perfil) y administración de pacientes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_paciente_service, require_admin, require_paciente
from app.models import Usuario
from app.schemas import PacienteAdminOut, PacienteOut, PacienteUpdate
from app.services import PacienteService

router = APIRouter()


@router.get("/me", response_model=PacienteOut)
def obtener_mi_perfil(
    usuario: Usuario = Depends(require_paciente),
    paciente_service: PacienteService = Depends(get_paciente_service),
):
    return paciente_service.obtener_por_usuario(usuario.id)


@router.put("/me", response_model=PacienteOut)
def actualizar_mi_perfil(
    data: PacienteUpdate,
    usuario: Usuario = Depends(require_paciente),
    db: Session = Depends(get_db),
    paciente_service: PacienteService = Depends(get_paciente_service),
):
    paciente = paciente_service.actualizar_perfil(usuario.id, data)
    db.commit()
    db.refresh(paciente)
    return paciente


# --------- Administración de pacientes (HU-16) ---------


@router.get("", response_model=list[PacienteAdminOut], dependencies=[Depends(require_admin)])
def listar_pacientes(
    skip: int = 0,
    limit: int = 50,
    paciente_service: PacienteService = Depends(get_paciente_service),
):
    return paciente_service.listar(skip, limit)


@router.get("/{paciente_id}", response_model=PacienteAdminOut, dependencies=[Depends(require_admin)])
def obtener_paciente(
    paciente_id: int,
    paciente_service: PacienteService = Depends(get_paciente_service),
):
    return paciente_service.obtener_por_id(paciente_id)


@router.patch("/{paciente_id}/desactivar", response_model=PacienteAdminOut, dependencies=[Depends(require_admin)])
def desactivar_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    paciente_service: PacienteService = Depends(get_paciente_service),
):
    paciente = paciente_service.desactivar(paciente_id)
    db.commit()
    db.refresh(paciente)
    return paciente
