# SaludYa – Portal Web de Gestión Hospitalaria

## Fase 6 — Docker

Estado: **Aprobada**.

---

## 1. Servicios

`docker-compose.yml` (raíz del proyecto) define tres servicios en una
misma red bridge (`saludya_net`):

| Servicio | Imagen base | Puerto host | Rol |
|---|---|---|---|
| `db` | `postgres:15-alpine` | `5432` | Persiste los datos; ejecuta `database/schema.sql` y `database/seed.sql` al crear el volumen. |
| `backend` | `python:3.11-slim` (Dockerfile propio, multi-stage no necesario por ser interpretado) | `8000` | API FastAPI servida con Uvicorn. |
| `frontend` | `node:20-alpine` → `nginx:1.27-alpine` (build multi-stage) | `8080` | Build de producción de Vite, servido y proxied por Nginx. |

## 2. Orden de arranque y healthchecks

```
db (healthy) → backend (healthy) → frontend
```

- `db`: `pg_isready` cada 5s.
- `backend`: `GET /health` cada 10s (el endpoint ya existía desde la Fase 3, pensado para esto).
- `frontend`: depende de que `backend` esté `healthy` antes de arrancar, mediante `depends_on.condition: service_healthy`, para evitar que el proxy de Nginx reciba tráfico antes de que la API esté lista.

## 3. Backend (`backend/Dockerfile`)

Imagen `python:3.11-slim`. Instala `gcc`/`libpq-dev` (requeridos por
`psycopg2-binary` en la compilación de algunas ruedas) y `curl` (usado
por el `HEALTHCHECK`). Corre como usuario no root (`appuser`) — buena
práctica de seguridad en contenedores. Las dependencias (`requirements.txt`)
se copian e instalan **antes** que el código fuente, para que Docker
reutilice esa capa de caché mientras no cambien las dependencias.

## 4. Frontend (`frontend/Dockerfile`)

Build multi-stage:

1. **Etapa `build`** (`node:20-alpine`): `npm ci` + `npm run build` →
   genera `dist/` (build estático de Vite/React).
2. **Etapa `final`** (`nginx:1.27-alpine`): copia únicamente `dist/` y
   `nginx.conf`. La imagen final no contiene Node ni el código fuente,
   solo los archivos estáticos — más liviana y con menor superficie de ataque.

`frontend/nginx.conf` resuelve dos problemas del lado del servidor web:

- **Fallback de SPA**: `try_files $uri $uri/ /index.html` — evita 404 de
  Nginx al recargar una ruta de React Router como `/paciente/citas`.
- **Reverse proxy de la API**: `location /api/ { proxy_pass http://backend:8000/api/; }`
  — el navegador solo conoce un origen (`localhost:8080`), sin necesitar
  configurar CORS para producción/Docker (el backend igual lo tiene
  configurado para el desarrollo sin Docker, puerto 5173).

## 5. Variables de entorno

`.env.example` en la raíz documenta todas las variables que Docker
Compose inyecta a los tres servicios (credenciales de PostgreSQL, JWT,
CORS, reglas de horario, puertos). Se copia a `.env` (excluido de Git)
antes de `docker compose up`. `backend/.env.example` y
`frontend/.env.example` documentan el subconjunto relevante para correr
cada servicio *sin* Docker (Fases 3 y 4).

## 6. Datos de demostración

`database/seed.sql` inserta, solo la primera vez que se crea el volumen
(`docker-entrypoint-initdb.d` de la imagen oficial de PostgreSQL corre
los scripts una única vez): 8 especialidades, 6 médicos con sus
relaciones N:M, un usuario administrador y un usuario paciente. Las
contraseñas de ambos se insertan como hash bcrypt real (no en texto
plano), generado y verificado antes de escribirse en el script.

## 7. Verificación realizada

Este entorno de desarrollo no tiene Docker instalado (Windows sin
Docker Desktop). La validación se hizo en los niveles que sí son
posibles sin él, y quedó documentada explícitamente como limitación —
no oculta:

- **Sintaxis y coherencia**: revisión manual de `docker-compose.yml` y
  ambos `Dockerfile` línea por línea; los puertos, nombres de servicio
  (`db`, `backend`) y variables de entorno referenciadas coinciden
  exactamente entre `docker-compose.yml`, `nginx.conf` y
  `app/core/config.py`.
- **Lo que sí corre sin Docker, se ejecutó realmente**: el backend
  (`pytest`, 67 passed + 1 xfail, 96% cobertura) y el frontend
  (`npm test`, `npm run build`, `npm run lint`) se instalaron y
  corrieron de verdad contra el código final — ver Fase 5. Esto cubre
  todo el código de aplicación que corre *dentro* de los contenedores;
  lo único no verificado en este entorno es la orquestación de Docker
  Compose en sí (construcción de imágenes, red entre contenedores,
  arranque condicionado por healthchecks).
- **Verificación pendiente recomendada**, a ejecutar en un entorno con
  Docker disponible (por ejemplo, al clonar este repositorio desde
  GitHub en una máquina con Docker Desktop):

  ```bash
  docker compose up --build
  curl http://localhost:8000/health
  curl http://localhost:8080
  ```

## 8. Checklist de cierre de Fase 6

- [x] `docker-compose.yml` con los tres servicios (`db`, `backend`, `frontend`).
- [x] Healthchecks en los tres servicios; arranque ordenado con `depends_on: condition: service_healthy`.
- [x] `Dockerfile` de backend: usuario no root, healthcheck, capas cacheables.
- [x] `Dockerfile` de frontend: build multi-stage, imagen final sin Node.
- [x] `nginx.conf` con fallback de SPA y reverse proxy hacia el backend.
- [x] Variables de entorno documentadas en `.env.example` (raíz, backend, frontend).
- [x] `database/seed.sql` con datos de demostración y credenciales documentadas.
- [x] Limitación de verificación (sin Docker en este entorno) documentada explícitamente, con los pasos exactos para validarlo donde sí hay Docker disponible.

**Aprobada por el cliente el 2026-08-07.** Fase 7 (Documentación) desarrollada a continuación.
