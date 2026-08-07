# API — SaludYa

API REST servida por FastAPI. Documentación interactiva autogenerada
disponible en `/docs` (Swagger UI) y `/redoc` cuando el backend está
corriendo. Este documento es la referencia legible sin necesidad de
levantar el servidor.

- **Base URL** (Docker / producción, vía proxy de Nginx): `/api/v1`
- **Base URL** (desarrollo sin Docker): `http://localhost:8000/api/v1`
- **Autenticación**: `Authorization: Bearer <token>` (JWT obtenido en `/auth/login`)
- **Formato de error**: `{ "detail": "mensaje legible" }`

## Códigos de estado usados

| Código | Significado en esta API |
|---|---|
| `200` | Operación exitosa (lectura o actualización) |
| `201` | Recurso creado |
| `401` | No autenticado (falta token o es inválido/expirado) |
| `403` | Autenticado, pero sin permiso para esta acción (rol incorrecto, recurso ajeno) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (correo/documento duplicado, horario ya ocupado, cita ya cancelada) |
| `422` | Violación de regla de negocio o de validación de datos |

---

## Auth

### `POST /auth/register` — público

Registra una cuenta de paciente (HU-05).

**Body**

```json
{
  "email": "paciente@ejemplo.com",
  "password": "Clave1234",
  "nombre": "Ana",
  "apellido": "Pérez",
  "documento_identidad": "123456789",
  "telefono": "+1 555 0000",
  "direccion": "Calle 123",
  "fecha_nacimiento": "1995-05-20"
}
```

`password`: mínimo 8 caracteres, al menos una letra y un número.
`telefono`, `direccion`, `fecha_nacimiento` son opcionales.

**201** → `UsuarioOut` (sin `password`/`password_hash`). **409** si el
correo o el documento ya existen. **422** si la contraseña no cumple
la regla o el correo no es válido.

### `POST /auth/login` — público

Inicia sesión (HU-06).

**Body**: `{ "email": "...", "password": "..." }`
**200** → `{ "access_token": "...", "token_type": "bearer", "rol": "paciente" }`
**401** si las credenciales son incorrectas o la cuenta está desactivada.

### `GET /auth/me` — autenticado

Perfil del usuario del token actual (cualquier rol). **401** sin token.

---

## Pacientes

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/pacientes/me` | paciente | Ver mi perfil (HU-07) |
| PUT | `/pacientes/me` | paciente | Editar mi perfil (HU-07) |
| GET | `/pacientes` | admin | Listar pacientes, paginado (`?skip=&limit=`) (HU-16) |
| GET | `/pacientes/{id}` | admin | Detalle de un paciente (HU-16) |
| PATCH | `/pacientes/{id}/desactivar` | admin | Desactivar cuenta (borrado lógico) (HU-16) |

`PUT /pacientes/me` acepta cualquier subconjunto de: `nombre`,
`apellido`, `telefono`, `direccion`, `fecha_nacimiento` (el correo y el
documento no son editables).

---

## Especialidades

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/especialidades` | público | Listado activo (HU-02) |
| GET | `/especialidades/{id}` | público | Detalle |
| GET | `/especialidades/admin/todas` | admin | Incluye inactivas |
| POST | `/especialidades` | admin | Crear (HU-14) |
| PUT | `/especialidades/{id}` | admin | Editar (HU-14) |
| DELETE | `/especialidades/{id}` | admin | Desactivar (borrado lógico) |

`POST`/`PUT` body: `{ "nombre": "...", "descripcion": "..." }`. **409**
al crear con un nombre ya existente. **409** al desactivar una
especialidad con médicos activos asociados.

---

## Médicos

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/medicos` | público | Listado activo (HU-03) |
| GET | `/medicos/{id}` | público | Detalle, incluye especialidades |
| GET | `/medicos/admin/todos` | admin | Incluye inactivos |
| POST | `/medicos` | admin | Crear (HU-13) |
| PUT | `/medicos/{id}` | admin | Editar (HU-13) |
| DELETE | `/medicos/{id}` | admin | Desactivar (borrado lógico) |

**Body de creación**:

```json
{
  "nombre": "Laura",
  "apellido": "Martínez",
  "documento_identidad": "2000000001",
  "email": "laura@saludya.com",
  "telefono": "+1 555 0001",
  "especialidad_ids": [1, 3]
}
```

`especialidad_ids` requiere al menos un elemento (**422** si va
vacío). **404** si algún id de especialidad no existe. **409** si el
documento ya está registrado.

---

## Citas

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/citas` | paciente | Agendar cita (HU-08) |
| GET | `/citas/me` | paciente | Mis citas, pendientes e historial (HU-09) |
| PATCH | `/citas/{id}/cancelar` | paciente | Cancelar cita propia (HU-10) |
| GET | `/citas` | admin | Todas las citas, con filtros (HU-15) |
| PATCH | `/citas/{id}/cancelar/admin` | admin | Cancelar cualquier cita (HU-15) |

**Body de `POST /citas`**:

```json
{ "medico_id": 1, "especialidad_id": 2, "fecha": "2026-08-20", "hora": "09:00:00" }
```

Validaciones (en orden): médico y especialidad deben existir y estar
activos (**404**) → el médico debe practicar esa especialidad
(**422**) → no domingo, horario 7:00-17:00, no fecha/hora pasada
(**422**) → el médico no debe tener ya una cita activa en ese horario
(**409**).

**Filtros de `GET /citas`** (admin, todos opcionales, combinables):
`medico_id`, `especialidad_id`, `estado` (`pendiente|completada|cancelada`), `fecha`.

**Body de cancelación** (ambas rutas): `{ "motivo_cancelacion": "texto opcional" }`.
**403** si un paciente intenta cancelar una cita que no es suya.
**409** si la cita ya estaba cancelada.

---

## Dashboard

### `GET /dashboard/stats` — admin

Métricas del panel administrativo (HU-12).

```json
{
  "citas_hoy": 4,
  "citas_pendientes": 12,
  "citas_por_especialidad": { "Medicina General": 5, "Cardiología": 3 },
  "medicos_activos": 6,
  "pacientes_registrados": 21
}
```

`citas_por_especialidad` cuenta únicamente citas no canceladas.

---

## Salud del servicio

### `GET /health` — público

Usado por el `HEALTHCHECK` de Docker. Responde `{ "status": "ok" }` sin
tocar la base de datos (comprobación de vida del proceso, no de
disponibilidad de PostgreSQL).
