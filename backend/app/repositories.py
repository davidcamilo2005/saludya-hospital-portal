"""Capa de repositorios (patrón Repository, principio de inversión de dependencias).

Cada repositorio define una interfaz abstracta (lo que la capa de
servicios necesita) y una implementación concreta con SQLAlchemy. Los
servicios (app/services.py) dependen de las interfaces, no de SQLAlchemy
directamente, de modo que la lógica de negocio no conoce el motor de
persistencia (Clean Architecture: las capas internas no dependen de las
externas).
"""

from abc import ABC, abstractmethod
from datetime import date
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models import Cita, Especialidad, Medico, Paciente, Usuario, medico_especialidad

# =========================================================
# Usuario
# =========================================================


class UsuarioRepository(ABC):
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Usuario]: ...

    @abstractmethod
    def get_by_id(self, usuario_id: int) -> Optional[Usuario]: ...

    @abstractmethod
    def create(self, usuario: Usuario) -> Usuario: ...


class SqlAlchemyUsuarioRepository(UsuarioRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[Usuario]:
        return self.db.query(Usuario).filter(Usuario.email == email).first()

    def get_by_id(self, usuario_id: int) -> Optional[Usuario]:
        return self.db.query(Usuario).filter(Usuario.id == usuario_id).first()

    def create(self, usuario: Usuario) -> Usuario:
        self.db.add(usuario)
        self.db.flush()
        return usuario


# =========================================================
# Paciente
# =========================================================


class PacienteRepository(ABC):
    @abstractmethod
    def get_by_id(self, paciente_id: int) -> Optional[Paciente]: ...

    @abstractmethod
    def get_by_usuario_id(self, usuario_id: int) -> Optional[Paciente]: ...

    @abstractmethod
    def get_by_documento(self, documento_identidad: str) -> Optional[Paciente]: ...

    @abstractmethod
    def create(self, paciente: Paciente) -> Paciente: ...

    @abstractmethod
    def list_all(self, skip: int, limit: int) -> list[Paciente]: ...


class SqlAlchemyPacienteRepository(PacienteRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, paciente_id: int) -> Optional[Paciente]:
        return (
            self.db.query(Paciente)
            .options(joinedload(Paciente.usuario))
            .filter(Paciente.id == paciente_id)
            .first()
        )

    def get_by_usuario_id(self, usuario_id: int) -> Optional[Paciente]:
        return (
            self.db.query(Paciente)
            .options(joinedload(Paciente.usuario))
            .filter(Paciente.usuario_id == usuario_id)
            .first()
        )

    def get_by_documento(self, documento_identidad: str) -> Optional[Paciente]:
        return self.db.query(Paciente).filter(Paciente.documento_identidad == documento_identidad).first()

    def create(self, paciente: Paciente) -> Paciente:
        self.db.add(paciente)
        self.db.flush()
        return paciente

    def list_all(self, skip: int = 0, limit: int = 50) -> list[Paciente]:
        return (
            self.db.query(Paciente)
            .options(joinedload(Paciente.usuario))
            .order_by(Paciente.id)
            .offset(skip)
            .limit(limit)
            .all()
        )


# =========================================================
# Médico
# =========================================================


class MedicoRepository(ABC):
    @abstractmethod
    def get_by_id(self, medico_id: int) -> Optional[Medico]: ...

    @abstractmethod
    def get_by_documento(self, documento_identidad: str) -> Optional[Medico]: ...

    @abstractmethod
    def list_active(self) -> list[Medico]: ...

    @abstractmethod
    def list_all(self) -> list[Medico]: ...

    @abstractmethod
    def create(self, medico: Medico) -> Medico: ...

    @abstractmethod
    def get_especialidades_por_ids(self, especialidad_ids: list[int]) -> list[Especialidad]: ...


class SqlAlchemyMedicoRepository(MedicoRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, medico_id: int) -> Optional[Medico]:
        return (
            self.db.query(Medico)
            .options(joinedload(Medico.especialidades))
            .filter(Medico.id == medico_id)
            .first()
        )

    def get_by_documento(self, documento_identidad: str) -> Optional[Medico]:
        return self.db.query(Medico).filter(Medico.documento_identidad == documento_identidad).first()

    def list_active(self) -> list[Medico]:
        return (
            self.db.query(Medico)
            .options(joinedload(Medico.especialidades))
            .filter(Medico.is_active.is_(True))
            .order_by(Medico.apellido)
            .all()
        )

    def list_all(self) -> list[Medico]:
        return (
            self.db.query(Medico).options(joinedload(Medico.especialidades)).order_by(Medico.apellido).all()
        )

    def create(self, medico: Medico) -> Medico:
        self.db.add(medico)
        self.db.flush()
        return medico

    def get_especialidades_por_ids(self, especialidad_ids: list[int]) -> list[Especialidad]:
        return self.db.query(Especialidad).filter(Especialidad.id.in_(especialidad_ids)).all()


# =========================================================
# Especialidad
# =========================================================


class EspecialidadRepository(ABC):
    @abstractmethod
    def get_by_id(self, especialidad_id: int) -> Optional[Especialidad]: ...

    @abstractmethod
    def get_by_nombre(self, nombre: str) -> Optional[Especialidad]: ...

    @abstractmethod
    def list_active(self) -> list[Especialidad]: ...

    @abstractmethod
    def list_all(self) -> list[Especialidad]: ...

    @abstractmethod
    def create(self, especialidad: Especialidad) -> Especialidad: ...

    @abstractmethod
    def tiene_medicos_activos(self, especialidad_id: int) -> bool: ...


class SqlAlchemyEspecialidadRepository(EspecialidadRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, especialidad_id: int) -> Optional[Especialidad]:
        return self.db.query(Especialidad).filter(Especialidad.id == especialidad_id).first()

    def get_by_nombre(self, nombre: str) -> Optional[Especialidad]:
        return self.db.query(Especialidad).filter(Especialidad.nombre == nombre).first()

    def list_active(self) -> list[Especialidad]:
        return (
            self.db.query(Especialidad)
            .filter(Especialidad.is_active.is_(True))
            .order_by(Especialidad.nombre)
            .all()
        )

    def list_all(self) -> list[Especialidad]:
        return self.db.query(Especialidad).order_by(Especialidad.nombre).all()

    def create(self, especialidad: Especialidad) -> Especialidad:
        self.db.add(especialidad)
        self.db.flush()
        return especialidad

    def tiene_medicos_activos(self, especialidad_id: int) -> bool:
        count = (
            self.db.query(func.count(Medico.id))
            .join(medico_especialidad, medico_especialidad.c.medico_id == Medico.id)
            .filter(medico_especialidad.c.especialidad_id == especialidad_id, Medico.is_active.is_(True))
            .scalar()
        )
        return bool(count and count > 0)


# =========================================================
# Cita
# =========================================================


class CitaRepository(ABC):
    @abstractmethod
    def get_by_id(self, cita_id: int) -> Optional[Cita]: ...

    @abstractmethod
    def create(self, cita: Cita) -> Cita: ...

    @abstractmethod
    def existe_conflicto(self, medico_id: int, fecha: date, hora) -> bool: ...

    @abstractmethod
    def list_by_paciente(self, paciente_id: int) -> list[Cita]: ...

    @abstractmethod
    def list_all(
        self,
        medico_id: Optional[int] = None,
        especialidad_id: Optional[int] = None,
        estado: Optional[str] = None,
        fecha: Optional[date] = None,
    ) -> list[Cita]: ...

    @abstractmethod
    def contar_por_fecha(self, fecha: date) -> int: ...

    @abstractmethod
    def contar_por_estado(self, estado: str) -> int: ...

    @abstractmethod
    def contar_por_especialidad(self) -> dict[str, int]: ...


class SqlAlchemyCitaRepository(CitaRepository):
    def __init__(self, db: Session):
        self.db = db

    def _query_detalle(self):
        return self.db.query(Cita).options(joinedload(Cita.medico), joinedload(Cita.especialidad))

    def get_by_id(self, cita_id: int) -> Optional[Cita]:
        return self._query_detalle().filter(Cita.id == cita_id).first()

    def create(self, cita: Cita) -> Cita:
        self.db.add(cita)
        self.db.flush()
        return cita

    def existe_conflicto(self, medico_id: int, fecha: date, hora) -> bool:
        conflicto = (
            self.db.query(Cita)
            .filter(
                Cita.medico_id == medico_id,
                Cita.fecha == fecha,
                Cita.hora == hora,
                Cita.estado != "cancelada",
            )
            .first()
        )
        return conflicto is not None

    def list_by_paciente(self, paciente_id: int) -> list[Cita]:
        return (
            self._query_detalle()
            .filter(Cita.paciente_id == paciente_id)
            .order_by(Cita.fecha.desc(), Cita.hora.desc())
            .all()
        )

    def list_all(
        self,
        medico_id: Optional[int] = None,
        especialidad_id: Optional[int] = None,
        estado: Optional[str] = None,
        fecha: Optional[date] = None,
    ) -> list[Cita]:
        query = self._query_detalle()
        if medico_id is not None:
            query = query.filter(Cita.medico_id == medico_id)
        if especialidad_id is not None:
            query = query.filter(Cita.especialidad_id == especialidad_id)
        if estado is not None:
            query = query.filter(Cita.estado == estado)
        if fecha is not None:
            query = query.filter(Cita.fecha == fecha)
        return query.order_by(Cita.fecha.desc(), Cita.hora.desc()).all()

    def contar_por_fecha(self, fecha: date) -> int:
        return self.db.query(func.count(Cita.id)).filter(Cita.fecha == fecha).scalar() or 0

    def contar_por_estado(self, estado: str) -> int:
        return self.db.query(func.count(Cita.id)).filter(Cita.estado == estado).scalar() or 0

    def contar_por_especialidad(self) -> dict[str, int]:
        filas = (
            self.db.query(Especialidad.nombre, func.count(Cita.id))
            .join(Cita, Cita.especialidad_id == Especialidad.id)
            .filter(Cita.estado != "cancelada")
            .group_by(Especialidad.nombre)
            .all()
        )
        return {nombre: total for nombre, total in filas}
