"""Esquemas Pydantic (DTOs de entrada/salida de la API).

Separados de los modelos ORM (app/models.py) a propósito: la API nunca
expone directamente un modelo de base de datos (p. ej. nunca se serializa
password_hash), y las validaciones de entrada (formato de correo, fuerza
de contraseña) viven aquí, no en el ORM.
"""

from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# =========================================================
# Auth / Usuario
# =========================================================


class UsuarioRegistro(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    documento_identidad: str = Field(min_length=3, max_length=30)
    telefono: Optional[str] = Field(default=None, max_length=20)
    direccion: Optional[str] = Field(default=None, max_length=200)
    fecha_nacimiento: Optional[date] = None

    @field_validator("password")
    @classmethod
    def password_segura(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe incluir al menos un número")
        if not any(c.isalpha() for c in v):
            raise ValueError("La contraseña debe incluir al menos una letra")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    nombre: str
    apellido: str
    rol: str
    is_active: bool


# =========================================================
# Paciente
# =========================================================


class PacienteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    documento_identidad: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    usuario: UsuarioOut


class PacienteUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(default=None, min_length=1, max_length=100)
    telefono: Optional[str] = Field(default=None, max_length=20)
    direccion: Optional[str] = Field(default=None, max_length=200)
    fecha_nacimiento: Optional[date] = None


class PacienteAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    documento_identidad: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    usuario: UsuarioOut


# =========================================================
# Especialidad
# =========================================================


class EspecialidadBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = None


class EspecialidadCreate(EspecialidadBase):
    pass


class EspecialidadUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = None
    is_active: Optional[bool] = None


class EspecialidadOut(EspecialidadBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool


# =========================================================
# Médico
# =========================================================


class MedicoBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    documento_identidad: str = Field(min_length=3, max_length=30)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(default=None, max_length=20)


class MedicoCreate(MedicoBase):
    especialidad_ids: list[int] = Field(min_length=1)


class MedicoUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(default=None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(default=None, max_length=20)
    is_active: Optional[bool] = None
    especialidad_ids: Optional[list[int]] = None


class MedicoOut(MedicoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    especialidades: list[EspecialidadOut] = []


# =========================================================
# Cita
# =========================================================


class CitaCreate(BaseModel):
    medico_id: int
    especialidad_id: int
    fecha: date
    hora: time


class CitaCancelar(BaseModel):
    motivo_cancelacion: Optional[str] = Field(default=None, max_length=500)


class CitaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    paciente_id: int
    medico_id: int
    especialidad_id: int
    fecha: date
    hora: time
    estado: str
    motivo_cancelacion: Optional[str] = None
    created_at: datetime


class CitaDetalleOut(CitaOut):
    medico: MedicoOut
    especialidad: EspecialidadOut


# =========================================================
# Dashboard
# =========================================================


class DashboardStats(BaseModel):
    citas_hoy: int
    citas_pendientes: int
    citas_por_especialidad: dict[str, int]
    medicos_activos: int
    pacientes_registrados: int
