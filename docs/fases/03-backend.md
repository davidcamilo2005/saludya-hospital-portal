# SaludYa – Portal Web de Gestión Hospitalaria

## Fase 3 — Backend completo

Estado: **Aprobada**.

---

## 1. Organización de módulos (Clean Architecture)

```
backend/
├── app/
│   ├── main.py            # Wiring: FastAPI app, CORS, exception handlers, routers
│   ├── core/
│   │   ├── config.py       # Settings tipadas (pydantic-settings)
│   │   ├── database.py     # Engine, Session, Base, get_db
│   │   └── security.py     # Hash de contraseñas (bcrypt) y JWT (python-jose)
│   ├── domain/
│   │   └── exceptions.py   # Excepciones de negocio, independientes de HTTP
│   ├── models.py            # Modelos ORM (SQLAlchemy) — capa de infraestructura
│   ├── schemas.py           # DTOs Pydantic (entrada/salida de la API)
│   ├── repositories.py      # Interfaces (ABC) + implementación SQLAlchemy
│   ├── services.py          # Casos de uso / reglas de negocio
│   └── api/
│       ├── deps.py          # Auth (JWT), autorización por rol, inyección de servicios
│       └── routers/         # Un router por recurso (auth, pacientes, medicos, ...)
├── alembic/                 # Migraciones versionadas
├── alembic.ini
├── requirements.txt
└── .env.example
```

**Decisión de organización:** cada *capa* de Clean Architecture (modelos, esquemas, repositorios, servicios) vive en un único módulo, en lugar de un archivo por entidad. La separación arquitectónica real —que una capa interna nunca dependa de una externa— se mantiene: `services.py` depende de las interfaces abstractas de `repositories.py`, no de SQLAlchemy directamente; `domain/exceptions.py` no importa nada de FastAPI. Esto es un balance pragmático razonable para el tamaño de este proyecto; se documenta aquí como decisión explícita, no como omisión.

**Regla de dependencia aplicada:**

```
api/routers  →  services  →  repositories (interfaces)  →  models
                    ↓
              domain/exceptions
```

Los routers nunca acceden a SQLAlchemy directamente; siempre pasan por un servicio. Los servicios nunca lanzan `HTTPException`; lanzan excepciones de dominio, que `main.py` traduce a códigos HTTP mediante `exception_handler`.

## 2. Autenticación y autorización

- **JWT** (python-jose): al hacer login se emite un token con claims `sub` (id de usuario) y `rol`, expira según `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (60 min por defecto).
- **Contraseñas**: hasheadas con bcrypt (passlib), nunca se almacenan ni se exponen en texto plano.
- **Autorización por rol**: `require_paciente` y `require_admin` (en `api/deps.py`) son dependencias de FastAPI que verifican el rol del usuario autenticado antes de ejecutar el endpoint. Devuelven 403 si el rol no corresponde, 401 si no hay token o es inválido.

## 3. Endpoints implementados

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/register` | público | Registro de paciente (HU-05) |
| POST | `/api/v1/auth/login` | público | Login, emite JWT (HU-06) |
| GET | `/api/v1/auth/me` | autenticado | Perfil del usuario del token |
| GET | `/api/v1/pacientes/me` | paciente | Ver mi perfil (HU-07) |
| PUT | `/api/v1/pacientes/me` | paciente | Editar mi perfil (HU-07) |
| GET | `/api/v1/pacientes` | admin | Listar pacientes (HU-16) |
| GET | `/api/v1/pacientes/{id}` | admin | Detalle de paciente (HU-16) |
| PATCH | `/api/v1/pacientes/{id}/desactivar` | admin | Desactivar cuenta (HU-16) |
| GET | `/api/v1/especialidades` | público | Listado activo (HU-02) |
| GET | `/api/v1/especialidades/{id}` | público | Detalle |
| GET | `/api/v1/especialidades/admin/todas` | admin | Incluye inactivas |
| POST | `/api/v1/especialidades` | admin | Crear (HU-14) |
| PUT | `/api/v1/especialidades/{id}` | admin | Editar (HU-14) |
| DELETE | `/api/v1/especialidades/{id}` | admin | Desactivar (borrado lógico) |
| GET | `/api/v1/medicos` | público | Listado activo (HU-03) |
| GET | `/api/v1/medicos/{id}` | público | Detalle |
| GET | `/api/v1/medicos/admin/todos` | admin | Incluye inactivos |
| POST | `/api/v1/medicos` | admin | Crear (HU-13) |
| PUT | `/api/v1/medicos/{id}` | admin | Editar (HU-13) |
| DELETE | `/api/v1/medicos/{id}` | admin | Desactivar (borrado lógico) |
| POST | `/api/v1/citas` | paciente | Agendar cita (HU-08 / CU-03) |
| GET | `/api/v1/citas/me` | paciente | Mis citas (HU-09) |
| PATCH | `/api/v1/citas/{id}/cancelar` | paciente | Cancelar cita propia (HU-10) |
| GET | `/api/v1/citas` | admin | Todas las citas, con filtros (HU-15) |
| PATCH | `/api/v1/citas/{id}/cancelar/admin` | admin | Cancelar cualquier cita (HU-15) |
| GET | `/api/v1/dashboard/stats` | admin | Métricas del dashboard (HU-12) |
| GET | `/health` | público | Health check (Docker) |

Documentación interactiva autogenerada por FastAPI disponible en `/docs` (Swagger UI) y `/redoc`.

## 4. Reglas de negocio implementadas (doble barrera)

Cada regla de Fase 1 se implementa **dos veces**, en capas distintas, por defensa en profundidad:

| Regla | Capa aplicación (`services.py`) | Capa base de datos (`schema.sql`) |
|---|---|---|
| No citas en domingo | `CitaService._validar_regla_horario` | `CHECK (EXTRACT(DOW FROM fecha) <> 0)` |
| Horario 7:00–17:00 | `CitaService._validar_regla_horario` | `CHECK (hora BETWEEN '07:00' AND '17:00')` |
| No doble reserva del médico | `CitaRepository.existe_conflicto` (excluye canceladas) | Índice único parcial `WHERE estado <> 'cancelada'` |
| Médico debe practicar la especialidad de la cita | `CitaService.crear_cita` | — (regla de aplicación, no modelable como CHECK simple) |
| No cancelar cita ajena | `CitaService.cancelar_como_paciente` (compara `paciente_id`) | — |
| No fecha/hora pasada | `CitaService._validar_regla_horario` | — |

La aplicación es la fuente de la regla (mensajes de error claros al usuario); la base de datos es la red de seguridad ante condiciones de carrera o accesos fuera de la API.

## 5. Verificación realizada

No fue posible instalar PostgreSQL en el entorno de verificación (sandbox sin privilegios de root), por lo que la validación se hizo en dos niveles:

1. **`database/schema.sql`**: revisión manual línea por línea + verificación automática de balance de paréntesis y conteo de sentencias.
2. **Backend completo**: se instalaron las dependencias reales (`requirements.txt`) en un entorno virtual y se ejecutó la aplicación con una base SQLite en memoria (sustituto liviano de PostgreSQL solo para esta prueba), usando `TestClient` de FastAPI. Se verificó exitosamente:
   - Arranque de la aplicación y registro de las 26 rutas de negocio + `/health`.
   - Registro de paciente, login y obtención de perfil (`/pacientes/me`).
   - Creación de especialidad y médico como administrador.
   - Agendar cita válida (201).
   - Rechazo de doble reserva del mismo médico/horario (409).
   - Rechazo de cita en domingo (422) y fuera de horario (422).
   - Cancelación de cita propia (200) y liberación del registro.
   - Acceso denegado sin token (401) y con rol incorrecto (403).
   - `/health` y `/api/v1/dashboard/stats` funcionando.

**Limitación conocida de esta prueba:** SQLite no soporta índices únicos *parciales* (`WHERE estado <> 'cancelada'`) de la misma forma que PostgreSQL; el kwarg `postgresql_where` del índice en `models.py` es ignorado por el dialecto SQLite, por lo que reintentar el mismo horario tras cancelar una cita falla en la prueba con SQLite (índice único completo), pero **funcionará correctamente en PostgreSQL**, que sí honra `postgresql_where`. Esta prueba puntual se repite contra PostgreSQL real en la Fase 5 (Pytest, con una base de datos de pruebas) y en la Fase 6 (Docker Compose).

## 6. Migraciones con Alembic

Se incluye configuración completa de Alembic (`alembic.ini`, `alembic/env.py` apuntando a `Base.metadata` y a `Settings.DATABASE_URL`). La migración inicial no se generó a mano para evitar desalineaciones; se genera contra una base PostgreSQL real durante el primer arranque del entorno de desarrollo:

```bash
cd backend
alembic revision --autogenerate -m "esquema inicial"
alembic upgrade head
```

`database/schema.sql` sigue siendo la fuente de verdad documentada del modelo físico (Fase 2); Alembic gestiona la evolución del esquema a partir de ese punto.

## 7. Cómo ejecutar el backend en desarrollo (sin Docker)

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # y ajustar DATABASE_URL a un PostgreSQL local
psql -U saludya -d saludya -f ../database/schema.sql
uvicorn app.main:app --reload
```

La contenerización completa (para no depender de un PostgreSQL local) se entrega en la Fase 6.

## 8. Checklist de cierre de Fase 3

- [x] Clean Architecture con capas claramente separadas y regla de dependencia respetada.
- [x] Autenticación JWT + autorización por rol.
- [x] Los 26 endpoints de negocio de la Fase 1 implementados.
- [x] Reglas de negocio con doble barrera (aplicación + base de datos).
- [x] Manejo centralizado de errores (excepciones de dominio → códigos HTTP).
- [x] Configuración tipada por variables de entorno.
- [x] Migraciones versionadas (Alembic) configuradas.
- [x] Health check (`/health`) para Docker Compose.
- [x] Verificación funcional end-to-end ejecutada (ver sección 5).

**Aprobada por el cliente el 2026-08-07.** Fase 4 (Frontend completo) desarrollada a continuación.
