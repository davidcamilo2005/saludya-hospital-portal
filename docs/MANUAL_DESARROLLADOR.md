# Manual del desarrollador — SaludYa

Guía para clonar, ejecutar, probar y extender este repositorio.

> 🔍 Si lo que buscas es **verificar que todo esté funcionando**
> (contenedores, logs, base de datos, pruebas), ve directo a
> [`docs/GUIA_DE_PRUEBAS.md`](GUIA_DE_PRUEBAS.md) — este manual se
> enfoca en la puesta en marcha y las convenciones de desarrollo.

## 1. Requisitos

| Vía | Requisitos |
|---|---|
| **Docker (recomendada)** | Docker + Docker Compose (Docker Desktop en Windows/Mac) |
| **Manual** | Python 3.11+, Node.js 20+, PostgreSQL 15 |

## 2. Puesta en marcha con Docker

```bash
git clone https://github.com/<tu-usuario>/saludya-hospital-portal.git
cd saludya-hospital-portal
cp .env.example .env
docker compose up --build
```

[INSERTAR IMAGEN: Docker Compose]
[INSERTAR IMAGEN: Docker Desktop]

Servicios: frontend `http://localhost:8080`, backend
`http://localhost:8000` (`/docs` para Swagger UI), PostgreSQL en
`localhost:5432`. Ver `docker-compose.yml` y `docs/fases/06-docker.md`
para el detalle de cada servicio.

**Comandos útiles**

```bash
docker compose logs -f backend      # logs en vivo de un servicio
docker compose exec backend bash    # shell dentro del contenedor
docker compose down                 # detener (conserva el volumen de datos)
docker compose down -v              # detener y borrar los datos (reinicia desde cero)
```

## 3. Puesta en marcha manual (sin Docker)

### 3.1 Base de datos

Con un PostgreSQL 15 corriendo localmente:

```bash
createuser saludya --pwprompt      # contraseña: saludya (o la que prefieras)
createdb saludya --owner=saludya
psql -U saludya -d saludya -f database/schema.sql
psql -U saludya -d saludya -f database/seed.sql
```

### 3.2 Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate              # Linux/Mac: source .venv/bin/activate
pip install -r requirements-dev.txt # incluye requirements.txt + pytest
cp .env.example .env                # ajustar DATABASE_URL si es necesario
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000` (`/docs` para Swagger UI).

### 3.3 Frontend

```bash
cd frontend
npm install
cp .env.example .env                # ajustar VITE_API_URL si el backend no está en localhost:8000
npm run dev
```

La SPA queda en `http://localhost:5173`.

## 4. Estructura del repositorio

```
backend/app/
├── main.py, models.py, schemas.py, repositories.py, services.py
├── core/       (config, database, security)
├── domain/     (excepciones de negocio)
└── api/        (deps + routers)

backend/tests/     Suite Pytest (conftest + un archivo por recurso)
backend/alembic/   Migraciones versionadas

frontend/src/
├── main.jsx, App.jsx, index.css
├── api/        (cliente Axios + funciones por recurso)
├── context/    (AuthContext)
├── routes/     (ProtectedRoute)
├── components/ (kit de UI + layouts)
├── constants/  (contenido institucional estático)
├── utils/      (validadores.js)
└── pages/      (public/, auth/, paciente/, admin/)

database/   schema.sql (modelo físico) + seed.sql (datos demo)
docs/       documentación final + docs/fases/ (historial de desarrollo)
```

Ver [`docs/ARQUITECTURA.md`](ARQUITECTURA.md) para el razonamiento
detrás de esta organización (Clean Architecture).

## 5. Convenciones

Ver [`CONTRIBUTING.md`](../CONTRIBUTING.md) en la raíz: convención de
commits, reglas de estilo de backend y frontend, y flujo de ramas.

## 6. Pruebas

```bash
# Backend (desde backend/, con el entorno virtual activo)
pytest                       # suite completa + cobertura (pytest.ini ya la configura)
pytest tests/test_citas.py   # un archivo puntual
pytest -k "domingo"          # por nombre de test

# Frontend (desde frontend/)
npm test                     # una corrida
npm run test:watch           # modo interactivo
npm run test:coverage        # con reporte de cobertura
```

[INSERTAR IMAGEN: Pytest]
[INSERTAR IMAGEN: Vitest]

## 7. Migraciones (Alembic)

`database/schema.sql` es la fuente de verdad documentada del modelo
físico (Fase 2). Alembic gestiona la evolución del esquema a partir de
ese punto, contra un PostgreSQL real:

```bash
cd backend
alembic revision --autogenerate -m "descripción del cambio"
alembic upgrade head
```

## 8. Solución de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| El backend no arranca: `ModuleNotFoundError: No module named 'psycopg2'` | No se instalaron las dependencias del `requirements.txt` en el entorno activo | `pip install -r requirements.txt` (o `requirements-dev.txt`) dentro del venv activado |
| `bcrypt` lanza un error de versión al hashear contraseñas | `bcrypt` >= 4.1 rompe la detección de versión que usa `passlib` 1.7.4 | Este repositorio ya fija `bcrypt<4.1` en `requirements.txt`; si lo actualizaste manualmente, reinstala con la versión fijada |
| El frontend no puede llamar a la API (`Network Error`) | `VITE_API_URL` apunta a un backend que no está corriendo, o CORS bloquea el origen | Verifica que el backend esté arriba y que `CORS_ORIGINS` (backend) incluya el origen del frontend (`http://localhost:5173` en desarrollo) |
| `docker compose up` falla en el healthcheck de `db` | El contenedor de PostgreSQL tarda más de lo esperado en arrancar (primera vez, creando el volumen) | Espera; `start_period: 10s` y `retries: 10` ya dan margen. Si persiste, revisa `docker compose logs db` |
| Los datos de `seed.sql` no aparecen | El volumen de PostgreSQL ya existía de una ejecución anterior (los scripts de `docker-entrypoint-initdb.d` solo corren una vez) | `docker compose down -v` para recrear el volumen desde cero |
