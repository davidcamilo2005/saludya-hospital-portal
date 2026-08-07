# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [1.1.0] - 2026-08-07

### Added

- Animaciones e ilustraciones SVG propias en todo el frontend (hero de
  la landing, avatares con iniciales, estados vacíos, página 404,
  panel de auth), sistema de scroll-reveal (`useReveal`/`<Reveal>`) y
  micro-interacciones en botones, tarjetas, menú y modales — respetando
  `prefers-reduced-motion`. Ver commit `feat(frontend): animaciones e
  ilustraciones SVG en toda la interfaz`.
- `docs/GUIA_DE_PRUEBAS.md`: guía de verificación end-to-end (cómo
  comprobar contenedores, logs, backend, base de datos, frontend y
  pruebas automatizadas), enlazada desde el `README.md` y
  `docs/MANUAL_DESARROLLADOR.md`.

## [1.0.0] - 2026-08-07

Primera versión completa y ejecutable del proyecto (Fases 1 a 8 cerradas).

### Added

- Backend FastAPI completo (`backend/`) con Clean Architecture: capas
  `models` → `repositories` → `services` → `api/routers`, autenticación
  JWT, autorización por rol y 26 endpoints de negocio + `/health`.
- Frontend React 18 + Vite + TailwindCSS completo (`frontend/`): módulos
  público, paciente y administrador, con rutas protegidas por rol.
- Modelo de base de datos PostgreSQL 15 normalizado (`database/schema.sql`)
  y datos de demostración (`database/seed.sql`).
- Suite de pruebas Backend (Pytest, 68 casos, 96% cobertura) y Frontend
  (Vitest + React Testing Library, 41 casos) — ambas verificadas en
  ejecución real, no solo escritas.
- Contenerización completa: `Dockerfile` de backend y frontend,
  `docker-compose.yml` con PostgreSQL + backend + frontend, healthchecks
  en los tres servicios y `depends_on: condition: service_healthy`.
- Documentación completa en `docs/`: `ARQUITECTURA.md`, `API.md`,
  `MANUAL_USUARIO.md`, `MANUAL_DESARROLLADOR.md`, `INFORME.md`, y el
  historial de fases de desarrollo en `docs/fases/`.
- Migraciones versionadas con Alembic (`backend/alembic/`).
- Archivos estándar de repositorio: `README.md`, `LICENSE` (MIT),
  `.gitignore`, `.env.example` (raíz, backend y frontend),
  `CONTRIBUTING.md`, este `CHANGELOG.md`.

### Fixed

- **Corrección crítica de integridad de datos**: `database/schema.sql`
  declaraba la regla "no dos citas para el mismo médico a la misma hora"
  como un `UNIQUE` de tabla completo. Eso impedía agendar una nueva cita
  en un horario cuya cita anterior había sido cancelada, contradiciendo
  la regla de negocio "cancelar una cita libera el horario del médico"
  (HU-10) — que sí estaba correctamente implementada en el modelo
  SQLAlchemy (`backend/app/models.py`) mediante un índice único parcial.
  Se reemplazó por `CREATE UNIQUE INDEX ... WHERE estado <> 'cancelada'`,
  alineando el modelo físico con el lógico y con la aplicación.

### Changed

- Reestructuración completa del código a una organización estándar de
  la industria: `DB1/` → `backend/app/` (paquete Python `app`, tal como
  ya asumían sus imports internos) y `frontend1/` → `frontend/src/`.
- `utils/validadores.js` extraído de `RegistroPage.jsx` a un módulo
  independiente y testeable, tal como documentaba (pero no implementaba)
  la Fase 5.
- `schema.sql` movido a `database/schema.sql`; los documentos de fase
  1-5 archivados en `docs/fases/` como registro histórico del proceso.

### Removed

- Carpeta `testing1bakend2frontend2/`, un directorio vacío de un intento
  anterior sin contenido.

## [0.1.0] - Fases 1-5 (borrador inicial, no publicado)

- Diseño y planificación (Fase 1), modelo de base de datos (Fase 2),
  código fuente de backend y frontend (Fases 3-4) documentados en
  `docs/fases/`. Esta etapa quedó sin infraestructura ejecutable
  (sin `requirements.txt`, `package.json`, configuración de build,
  pruebas reales ni Docker) — completada en la versión 1.0.0.
