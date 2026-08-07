"""Endpoints de citas: agendar/consultar/cancelar (paciente) y gestión (admin)."""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_cita_service, get_db, require_admin, require_paciente
from app.domain.exceptions import NotFoundError
from app.models import Usuario
from app.repositories import SqlAlchemyPacienteRepository
from app.schemas import CitaCancelar, CitaCreate, CitaDetalleOut
from app.services import CitaService

router = APIRouter()


def _paciente_id_actual(usuario: Usuario, db: Session) -> int:
    paciente = SqlAlchemyPacienteRepository(db).get_by_usuario_id(usuario.id)
    if paciente is None:
        raise NotFoundError("Perfil de paciente no encontrado")
    return paciente.id


@router.post("", response_model=CitaDetalleOut, status_code=201)
def agendar_cita(
    data: CitaCreate,
    usuario: Usuario = Depends(require_paciente),
    db: Session = Depends(get_db),
    cita_service: CitaService = Depends(get_cita_service),
):
    """HU-08 / CU-03: agenda una cita validando horario, día y disponibilidad."""
    paciente_id = _paciente_id_actual(usuario, db)
    cita = cita_service.crear_cita(paciente_id, data)
    db.commit()
    db.refresh(cita)
    return cita


@router.get("/me", response_model=list[CitaDetalleOut])
def mis_citas(
    usuario: Usuario = Depends(require_paciente),
    db: Session = Depends(get_db),
    cita_service: CitaService = Depends(get_cita_service),
):
    """HU-09: consulta las citas propias (próximas e historial)."""
    paciente_id = _paciente_id_actual(usuario, db)
    return cita_service.listar_por_paciente(paciente_id)


@router.patch("/{cita_id}/cancelar", response_model=CitaDetalleOut)
def cancelar_mi_cita(
    cita_id: int,
    data: CitaCancelar,
    usuario: Usuario = Depends(require_paciente),
    db: Session = Depends(get_db),
    cita_service: CitaService = Depends(get_cita_service),
):
    """HU-10: cancela una cita propia y libera el horario del médico."""
    paciente_id = _paciente_id_actual(usuario, db)
    cita = cita_service.cancelar_como_paciente(cita_id, paciente_id, data.motivo_cancelacion)
    db.commit()
    db.refresh(cita)
    return cita


# --------- Gestión administrativa de citas (HU-15) ---------


@router.get("", response_model=list[CitaDetalleOut], dependencies=[Depends(require_admin)])
def listar_todas_las_citas(
    medico_id: Optional[int] = None,
    especialidad_id: Optional[int] = None,
    estado: Optional[str] = Query(default=None, pattern="^(pendiente|completada|cancelada)$"),
    fecha: Optional[date] = None,
    cita_service: CitaService = Depends(get_cita_service),
):
    return cita_service.listar_todas(
        medico_id=medico_id, especialidad_id=especialidad_id, estado=estado, fecha=fecha
    )


@router.patch("/{cita_id}/cancelar/admin", response_model=CitaDetalleOut, dependencies=[Depends(require_admin)])
def cancelar_cita_admin(
    cita_id: int,
    data: CitaCancelar,
    db: Session = Depends(get_db),
    cita_service: CitaService = Depends(get_cita_service),
):
    cita = cita_service.cancelar_como_admin(cita_id, data.motivo_cancelacion)
    db.commit()
    db.refresh(cita)
    return cita
