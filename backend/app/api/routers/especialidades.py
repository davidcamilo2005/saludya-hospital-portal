"""Endpoints de especialidades: listado público + CRUD administrativo."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_especialidad_service, require_admin
from app.schemas import EspecialidadCreate, EspecialidadOut, EspecialidadUpdate
from app.services import EspecialidadService

router = APIRouter()


@router.get("", response_model=list[EspecialidadOut])
def listar_especialidades(especialidad_service: EspecialidadService = Depends(get_especialidad_service)):
    """Listado público: solo especialidades activas (HU-02)."""
    return especialidad_service.listar_publicas()


@router.get("/{especialidad_id}", response_model=EspecialidadOut)
def obtener_especialidad(
    especialidad_id: int,
    especialidad_service: EspecialidadService = Depends(get_especialidad_service),
):
    return especialidad_service.obtener(especialidad_id)


@router.get("/admin/todas", response_model=list[EspecialidadOut], dependencies=[Depends(require_admin)])
def listar_todas_admin(especialidad_service: EspecialidadService = Depends(get_especialidad_service)):
    """Listado administrativo: incluye especialidades inactivas (HU-14)."""
    return especialidad_service.listar_todas()


@router.post("", response_model=EspecialidadOut, status_code=201, dependencies=[Depends(require_admin)])
def crear_especialidad(
    data: EspecialidadCreate,
    db: Session = Depends(get_db),
    especialidad_service: EspecialidadService = Depends(get_especialidad_service),
):
    especialidad = especialidad_service.crear(data)
    db.commit()
    db.refresh(especialidad)
    return especialidad


@router.put("/{especialidad_id}", response_model=EspecialidadOut, dependencies=[Depends(require_admin)])
def actualizar_especialidad(
    especialidad_id: int,
    data: EspecialidadUpdate,
    db: Session = Depends(get_db),
    especialidad_service: EspecialidadService = Depends(get_especialidad_service),
):
    especialidad = especialidad_service.actualizar(especialidad_id, data)
    db.commit()
    db.refresh(especialidad)
    return especialidad


@router.delete("/{especialidad_id}", response_model=EspecialidadOut, dependencies=[Depends(require_admin)])
def desactivar_especialidad(
    especialidad_id: int,
    db: Session = Depends(get_db),
    especialidad_service: EspecialidadService = Depends(get_especialidad_service),
):
    """Borrado lógico: preserva el historial de citas asociado."""
    especialidad = especialidad_service.desactivar(especialidad_id)
    db.commit()
    db.refresh(especialidad)
    return especialidad
