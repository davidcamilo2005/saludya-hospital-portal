"""Capa de servicios (casos de uso / reglas de negocio).

Cada servicio recibe repositorios (interfaces, no implementaciones
concretas) por inyección de dependencias. Aquí vive toda la lógica de
negocio del proyecto: quién puede hacer qué, y las reglas de citas
(horario 7-17h, no domingos, no doble reserva) descritas en Fase 1.
Las restricciones de base de datos (CHECK, índice único parcial) son una
segunda barrera, no la única fuente de la regla.
"""

from datetime import date, datetime, time

from app.core.security import create_access_token, hash_password, verify_password
from app.domain.exceptions import BusinessRuleError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError
from app.models import Cita, Especialidad, Medico, Paciente, Usuario
from app.repositories import (
    CitaRepository,
    EspecialidadRepository,
    MedicoRepository,
    PacienteRepository,
    UsuarioRepository,
)
from app.schemas import (
    CitaCreate,
    EspecialidadCreate,
    EspecialidadUpdate,
    MedicoCreate,
    MedicoUpdate,
    PacienteUpdate,
    UsuarioRegistro,
)

DIA_DOMINGO = 6  # date.weekday(): lunes=0 ... domingo=6


# =========================================================
# Auth
# =========================================================


class AuthService:
    def __init__(self, usuario_repo: UsuarioRepository, paciente_repo: PacienteRepository):
        self.usuario_repo = usuario_repo
        self.paciente_repo = paciente_repo

    def registrar_paciente(self, data: UsuarioRegistro) -> Usuario:
        if self.usuario_repo.get_by_email(data.email):
            raise ConflictError("Ya existe una cuenta registrada con este correo")
        if self.paciente_repo.get_by_documento(data.documento_identidad):
            raise ConflictError("Ya existe un paciente registrado con este documento de identidad")

        usuario = Usuario(
            email=data.email,
            password_hash=hash_password(data.password),
            nombre=data.nombre,
            apellido=data.apellido,
            rol="paciente",
        )
        self.usuario_repo.create(usuario)

        paciente = Paciente(
            usuario=usuario,
            documento_identidad=data.documento_identidad,
            telefono=data.telefono,
            direccion=data.direccion,
            fecha_nacimiento=data.fecha_nacimiento,
        )
        self.paciente_repo.create(paciente)
        return usuario

    def autenticar(self, email: str, password: str) -> tuple[Usuario, str]:
        usuario = self.usuario_repo.get_by_email(email)
        if usuario is None or not verify_password(password, usuario.password_hash):
            raise UnauthorizedError("Correo o contraseña incorrectos")
        if not usuario.is_active:
            raise UnauthorizedError("La cuenta está desactivada")
        token = create_access_token(subject=str(usuario.id), rol=usuario.rol)
        return usuario, token


# =========================================================
# Paciente
# =========================================================


class PacienteService:
    def __init__(self, paciente_repo: PacienteRepository):
        self.paciente_repo = paciente_repo

    def obtener_por_usuario(self, usuario_id: int) -> Paciente:
        paciente = self.paciente_repo.get_by_usuario_id(usuario_id)
        if paciente is None:
            raise NotFoundError("Perfil de paciente no encontrado")
        return paciente

    def actualizar_perfil(self, usuario_id: int, data: PacienteUpdate) -> Paciente:
        paciente = self.obtener_por_usuario(usuario_id)
        if data.nombre is not None:
            paciente.usuario.nombre = data.nombre
        if data.apellido is not None:
            paciente.usuario.apellido = data.apellido
        if data.telefono is not None:
            paciente.telefono = data.telefono
        if data.direccion is not None:
            paciente.direccion = data.direccion
        if data.fecha_nacimiento is not None:
            paciente.fecha_nacimiento = data.fecha_nacimiento
        return paciente

    def listar(self, skip: int = 0, limit: int = 50) -> list[Paciente]:
        return self.paciente_repo.list_all(skip, limit)

    def obtener_por_id(self, paciente_id: int) -> Paciente:
        paciente = self.paciente_repo.get_by_id(paciente_id)
        if paciente is None:
            raise NotFoundError("Paciente no encontrado")
        return paciente

    def desactivar(self, paciente_id: int) -> Paciente:
        paciente = self.obtener_por_id(paciente_id)
        paciente.usuario.is_active = False
        return paciente


# =========================================================
# Especialidad
# =========================================================


class EspecialidadService:
    def __init__(self, especialidad_repo: EspecialidadRepository):
        self.especialidad_repo = especialidad_repo

    def listar_publicas(self) -> list[Especialidad]:
        return self.especialidad_repo.list_active()

    def listar_todas(self) -> list[Especialidad]:
        return self.especialidad_repo.list_all()

    def obtener(self, especialidad_id: int) -> Especialidad:
        especialidad = self.especialidad_repo.get_by_id(especialidad_id)
        if especialidad is None:
            raise NotFoundError("Especialidad no encontrada")
        return especialidad

    def crear(self, data: EspecialidadCreate) -> Especialidad:
        if self.especialidad_repo.get_by_nombre(data.nombre):
            raise ConflictError("Ya existe una especialidad con ese nombre")
        especialidad = Especialidad(nombre=data.nombre, descripcion=data.descripcion)
        return self.especialidad_repo.create(especialidad)

    def actualizar(self, especialidad_id: int, data: EspecialidadUpdate) -> Especialidad:
        especialidad = self.obtener(especialidad_id)
        if data.nombre is not None:
            especialidad.nombre = data.nombre
        if data.descripcion is not None:
            especialidad.descripcion = data.descripcion
        if data.is_active is not None:
            especialidad.is_active = data.is_active
        return especialidad

    def desactivar(self, especialidad_id: int) -> Especialidad:
        especialidad = self.obtener(especialidad_id)
        if self.especialidad_repo.tiene_medicos_activos(especialidad_id):
            raise ConflictError(
                "No se puede desactivar: hay médicos activos asociados a esta especialidad"
            )
        especialidad.is_active = False
        return especialidad


# =========================================================
# Médico
# =========================================================


class MedicoService:
    def __init__(self, medico_repo: MedicoRepository):
        self.medico_repo = medico_repo

    def listar_publicos(self) -> list[Medico]:
        return self.medico_repo.list_active()

    def listar_todos(self) -> list[Medico]:
        return self.medico_repo.list_all()

    def obtener(self, medico_id: int) -> Medico:
        medico = self.medico_repo.get_by_id(medico_id)
        if medico is None:
            raise NotFoundError("Médico no encontrado")
        return medico

    def crear(self, data: MedicoCreate) -> Medico:
        if self.medico_repo.get_by_documento(data.documento_identidad):
            raise ConflictError("Ya existe un médico con ese documento de identidad")
        especialidades = self.medico_repo.get_especialidades_por_ids(data.especialidad_ids)
        if len(especialidades) != len(set(data.especialidad_ids)):
            raise NotFoundError("Una o más especialidades indicadas no existen")

        medico = Medico(
            nombre=data.nombre,
            apellido=data.apellido,
            documento_identidad=data.documento_identidad,
            email=data.email,
            telefono=data.telefono,
            especialidades=especialidades,
        )
        return self.medico_repo.create(medico)

    def actualizar(self, medico_id: int, data: MedicoUpdate) -> Medico:
        medico = self.obtener(medico_id)
        if data.nombre is not None:
            medico.nombre = data.nombre
        if data.apellido is not None:
            medico.apellido = data.apellido
        if data.email is not None:
            medico.email = data.email
        if data.telefono is not None:
            medico.telefono = data.telefono
        if data.is_active is not None:
            medico.is_active = data.is_active
        if data.especialidad_ids is not None:
            especialidades = self.medico_repo.get_especialidades_por_ids(data.especialidad_ids)
            if len(especialidades) != len(set(data.especialidad_ids)):
                raise NotFoundError("Una o más especialidades indicadas no existen")
            medico.especialidades = especialidades
        return medico

    def desactivar(self, medico_id: int) -> Medico:
        medico = self.obtener(medico_id)
        medico.is_active = False
        return medico


# =========================================================
# Cita
# =========================================================


class CitaService:
    def __init__(
        self,
        cita_repo: CitaRepository,
        medico_repo: MedicoRepository,
        especialidad_repo: EspecialidadRepository,
        hora_inicio: int = 7,
        hora_fin: int = 17,
    ):
        self.cita_repo = cita_repo
        self.medico_repo = medico_repo
        self.especialidad_repo = especialidad_repo
        self.hora_inicio = hora_inicio
        self.hora_fin = hora_fin

    def _validar_regla_horario(self, fecha: date, hora: time) -> None:
        if fecha.weekday() == DIA_DOMINGO:
            raise BusinessRuleError("No se pueden agendar citas los domingos")

        if hora < time(self.hora_inicio, 0) or hora > time(self.hora_fin, 0):
            raise BusinessRuleError(
                f"El horario de atención es de {self.hora_inicio}:00 a {self.hora_fin}:00"
            )

        if datetime.combine(fecha, hora) < datetime.now():
            raise BusinessRuleError("No se pueden agendar citas en una fecha/hora pasada")

    def crear_cita(self, paciente_id: int, data: CitaCreate) -> Cita:
        medico = self.medico_repo.get_by_id(data.medico_id)
        if medico is None or not medico.is_active:
            raise NotFoundError("Médico no encontrado o inactivo")

        especialidad = self.especialidad_repo.get_by_id(data.especialidad_id)
        if especialidad is None or not especialidad.is_active:
            raise NotFoundError("Especialidad no encontrada o inactiva")

        if especialidad not in medico.especialidades:
            raise BusinessRuleError("El médico seleccionado no practica esa especialidad")

        self._validar_regla_horario(data.fecha, data.hora)

        if self.cita_repo.existe_conflicto(data.medico_id, data.fecha, data.hora):
            raise ConflictError("El médico ya tiene una cita agendada en ese horario")

        cita = Cita(
            paciente_id=paciente_id,
            medico_id=data.medico_id,
            especialidad_id=data.especialidad_id,
            fecha=data.fecha,
            hora=data.hora,
            estado="pendiente",
        )
        return self.cita_repo.create(cita)

    def listar_por_paciente(self, paciente_id: int) -> list[Cita]:
        return self.cita_repo.list_by_paciente(paciente_id)

    def listar_todas(self, **filtros) -> list[Cita]:
        return self.cita_repo.list_all(**filtros)

    def obtener(self, cita_id: int) -> Cita:
        cita = self.cita_repo.get_by_id(cita_id)
        if cita is None:
            raise NotFoundError("Cita no encontrada")
        return cita

    def cancelar_como_paciente(self, cita_id: int, paciente_id: int, motivo: str | None) -> Cita:
        cita = self.obtener(cita_id)
        if cita.paciente_id != paciente_id:
            raise ForbiddenError("No puedes cancelar una cita que no te pertenece")
        return self._cancelar(cita, motivo)

    def cancelar_como_admin(self, cita_id: int, motivo: str | None) -> Cita:
        cita = self.obtener(cita_id)
        return self._cancelar(cita, motivo)

    def _cancelar(self, cita: Cita, motivo: str | None) -> Cita:
        if cita.estado == "cancelada":
            raise ConflictError("La cita ya se encuentra cancelada")
        cita.estado = "cancelada"
        cita.motivo_cancelacion = motivo
        return cita


# =========================================================
# Dashboard
# =========================================================


class DashboardService:
    def __init__(self, cita_repo: CitaRepository, medico_repo: MedicoRepository, paciente_repo: PacienteRepository):
        self.cita_repo = cita_repo
        self.medico_repo = medico_repo
        self.paciente_repo = paciente_repo

    def estadisticas(self) -> dict:
        return {
            "citas_hoy": self.cita_repo.contar_por_fecha(date.today()),
            "citas_pendientes": self.cita_repo.contar_por_estado("pendiente"),
            "citas_por_especialidad": self.cita_repo.contar_por_especialidad(),
            "medicos_activos": len(self.medico_repo.list_active()),
            "pacientes_registrados": len(self.paciente_repo.list_all(skip=0, limit=10_000)),
        }
