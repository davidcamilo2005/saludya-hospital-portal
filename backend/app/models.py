"""Modelos ORM (SQLAlchemy). Reflejan exactamente database/schema.sql (Fase 2).

Todos los modelos viven en un único módulo por pragmatismo (proyecto de
tamaño moderado); la separación arquitectónica real está entre capas
(models -> repositories -> services -> api), no entre archivos dentro de
una misma capa. Ver docs/03-backend.md, sección "Organización de módulos".
"""

from datetime import date, datetime, time

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    Time,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# ---------------------------------------------------------
# Tabla intermedia N:M médico <-> especialidad
# ---------------------------------------------------------
medico_especialidad = Table(
    "medico_especialidad",
    Base.metadata,
    Column("medico_id", Integer, ForeignKey("medicos.id", ondelete="CASCADE"), primary_key=True),
    Column("especialidad_id", Integer, ForeignKey("especialidades.id", ondelete="CASCADE"), primary_key=True),
)


class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = (CheckConstraint("rol IN ('paciente', 'administrador')", name="chk_usuarios_rol"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    rol: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    paciente: Mapped["Paciente | None"] = relationship(
        back_populates="usuario", uselist=False, cascade="all, delete-orphan"
    )


class Paciente(Base):
    __tablename__ = "pacientes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    documento_identidad: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    telefono: Mapped[str | None] = mapped_column(String(20))
    direccion: Mapped[str | None] = mapped_column(String(200))
    fecha_nacimiento: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario: Mapped["Usuario"] = relationship(back_populates="paciente")
    citas: Mapped[list["Cita"]] = relationship(back_populates="paciente")


class Medico(Base):
    __tablename__ = "medicos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    documento_identidad: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(150), unique=True)
    telefono: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    especialidades: Mapped[list["Especialidad"]] = relationship(
        secondary=medico_especialidad, back_populates="medicos"
    )
    citas: Mapped[list["Cita"]] = relationship(back_populates="medico")


class Especialidad(Base):
    __tablename__ = "especialidades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    medicos: Mapped[list["Medico"]] = relationship(secondary=medico_especialidad, back_populates="especialidades")
    citas: Mapped[list["Cita"]] = relationship(back_populates="especialidad")


class Cita(Base):
    __tablename__ = "citas"
    __table_args__ = (
        CheckConstraint("estado IN ('pendiente', 'completada', 'cancelada')", name="chk_citas_estado"),
        # Índice único parcial: no dos citas ACTIVAS para el mismo médico a la
        # misma fecha/hora. Se declara aquí para que Alembic autogenerate lo
        # detecte; la fuente de verdad en producción es database/schema.sql.
        Index(
            "uq_citas_medico_fecha_hora_activa",
            "medico_id",
            "fecha",
            "hora",
            unique=True,
            postgresql_where=(Column("estado") != "cancelada"),
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    paciente_id: Mapped[int] = mapped_column(Integer, ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    medico_id: Mapped[int] = mapped_column(Integer, ForeignKey("medicos.id", ondelete="RESTRICT"), nullable=False)
    especialidad_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("especialidades.id", ondelete="RESTRICT"), nullable=False
    )
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    hora: Mapped[time] = mapped_column(Time, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), nullable=False, default="pendiente")
    motivo_cancelacion: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    paciente: Mapped["Paciente"] = relationship(back_populates="citas")
    medico: Mapped["Medico"] = relationship(back_populates="citas")
    especialidad: Mapped["Especialidad"] = relationship(back_populates="citas")
