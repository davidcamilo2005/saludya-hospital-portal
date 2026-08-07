"""Endpoints de médicos: listado público + CRUD administrativo."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_medico_service, require_admin
from app.schemas import MedicoCreate, MedicoOut, MedicoUpdate
from app.services import MedicoService

router = APIRouter()


@router.get("", response_model=list[MedicoOut])
def listar_medicos(medico_service: MedicoService = Depends(get_medico_service)):
    """Listado público: solo médicos activos (HU-03)."""
    return medico_service.listar_publicos()


@router.get("/admin/todos", response_model=list[MedicoOut], dependencies=[Depends(require_admin)])
def listar_todos_admin(medico_service: MedicoService = Depends(get_medico_service)):
    return medico_service.listar_todos()


@router.get("/{medico_id}", response_model=MedicoOut)
def obtener_medico(
    medico_id: int,
    medico_service: MedicoService = Depends(get_medico_service),
):
    return medico_service.obtener(medico_id)


@router.post("", response_model=MedicoOut, status_code=201, dependencies=[Depends(require_admin)])
def crear_medico(
    data: MedicoCreate,
    db: Session = Depends(get_db),
    medico_service: MedicoService = Depends(get_medico_service),
):
    medico = medico_service.crear(data)
    db.commit()
    db.refresh(medico)
    return medico


@router.put("/{medico_id}", response_model=MedicoOut, dependencies=[Depends(require_admin)])
def actualizar_medico(
    medico_id: int,
    data: MedicoUpdate,
    db: Session = Depends(get_db),
    medico_service: MedicoService = Depends(get_medico_service),
):
    medico = medico_service.actualizar(medico_id, data)
    db.commit()
    db.refresh(medico)
    return medico


@router.delete("/{medico_id}", response_model=MedicoOut, dependencies=[Depends(require_admin)])
def desactivar_medico(
    medico_id: int,
    db: Session = Depends(get_db),
    medico_service: MedicoService = Depends(get_medico_service),
):
    """Borrado lógico: preserva el historial de citas asociado."""
    medico = medico_service.desactivar(medico_id)
    db.commit()
    db.refresh(medico)
    return medico
