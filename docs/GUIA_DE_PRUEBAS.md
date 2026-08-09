# Guía de verificación y pruebas — SaludYa

Esta guía explica, paso a paso, cómo comprobar que **todo el sistema
funciona correctamente**: contenedores, backend, base de datos,
frontend y las pruebas automatizadas. Está pensada para que la puedas
seguir sin conocimientos técnicos previos — cada comando incluye qué
hace y qué deberías ver si todo está bien.

No hace falta seguirla completa de una vez: usa el índice para ir
directo a lo que necesitas revisar.

> 📑 Esta guía es **práctica** (comandos y qué hacer). Si necesitas un
> **documento formal por tema** —qué es cada herramienta, qué función
> cumple, dónde se practica en el proyecto y la evidencia real de sus
> pruebas— ver `docs/evidencias/`:
> [`01-testing-frontend-vitest.md`](evidencias/01-testing-frontend-vitest.md),
> [`02-testing-backend-pytest.md`](evidencias/02-testing-backend-pytest.md) y
> [`03-docker-compose.md`](evidencias/03-docker-compose.md).

## Índice

1. [Antes de empezar](#1-antes-de-empezar)
2. [Levantar el sistema](#2-levantar-el-sistema)
3. [¿Están corriendo los contenedores?](#3-están-corriendo-los-contenedores)
4. [Ver los registros (logs)](#4-ver-los-registros-logs)
5. [Verificar el backend (la API)](#5-verificar-el-backend-la-api)
6. [Verificar la base de datos](#6-verificar-la-base-de-datos)
7. [Verificar el frontend (la página web)](#7-verificar-el-frontend-la-página-web)
8. [Prueba manual completa, de principio a fin](#8-prueba-manual-completa-de-principio-a-fin)
9. [Ejecutar las pruebas automatizadas](#9-ejecutar-las-pruebas-automatizadas)
10. [Verificar el build de producción](#10-verificar-el-build-de-producción)
11. [Checklist rápido](#11-checklist-rápido)
12. [Solución de problemas comunes](#12-solución-de-problemas-comunes)
13. [Chuleta de comandos](#13-chuleta-de-comandos)

---

## 1. Antes de empezar

Necesitas [Docker Desktop](https://www.docker.com/products/docker-desktop/)
instalado y **abierto** (el ícono de la ballena 🐳 debe verse activo en
la barra de tareas). Todo lo de esta guía se ejecuta desde una
terminal (PowerShell o la terminal que uses) **ubicada en la carpeta
raíz del proyecto** (`saludya-hospital-portal/`, donde está el archivo
`docker-compose.yml`).

## 2. Levantar el sistema

```bash
docker compose up --build
```

Deja esa terminal abierta (verás los logs en vivo de los tres
servicios mezclados). Si prefieres recuperar el control de la terminal
y que corra "de fondo", usa:

```bash
docker compose up --build -d
```

La primera vez tarda varios minutos (descarga las imágenes base y
construye el backend/frontend); las siguientes veces es mucho más
rápido porque Docker reutiliza lo que no cambió.

## 3. ¿Están corriendo los contenedores?

### Opción A — Docker Desktop (visual)

Abre Docker Desktop → pestaña **Containers**. Deberías ver un grupo
llamado `saludya` con tres contenedores adentro:

```
saludya
├── saludya_db         ●  running (healthy)
├── saludya_backend    ●  running (healthy)
└── saludya_frontend   ●  running
```

Un punto verde y la palabra **"healthy"** (junto a `db` y `backend`)
significa que no solo están *encendidos*, sino que además pasaron su
chequeo de salud (`HEALTHCHECK`). `frontend` no muestra "healthy"
porque su `Dockerfile` no define uno explícito — si aparece
`running`, está bien.

[INSERTAR IMAGEN: Docker Desktop]

### Opción B — Terminal

```bash
docker compose ps
```

Salida esperada (resumida):

```
NAME               IMAGE                 STATUS                    PORTS
saludya_db         postgres:15-alpine    Up 2 minutes (healthy)    0.0.0.0:5432->5432/tcp
saludya_backend     saludya-backend       Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp
saludya_frontend    saludya-frontend      Up 2 minutes              0.0.0.0:8080->80/tcp
```

**Qué revisar:**

| Columna    | Qué significa                    | Qué esperar                                                                      |
| ---------- | --------------------------------- | --------------------------------------------------------------------------------- |
| `STATUS` | Estado del contenedor             | `Up ... (healthy)` — nunca `Restarting` ni `Exited`                        |
| `PORTS`  | Puertos expuestos a tu computador | Deben coincidir con`docker-compose.yml`/`.env` (por defecto 5432, 8000, 8080) |

Si un contenedor dice `Restarting` una y otra vez, o `Exited (1)`, algo
falló en su arranque — ve directo a la sección de
[logs](#4-ver-los-registros-logs) para ver el error exacto.

## 4. Ver los registros (logs)

Los logs son el historial de todo lo que un contenedor va imprimiendo
(peticiones recibidas, errores, mensajes de arranque). Son la primera
herramienta para diagnosticar cualquier problema.

**Ver los logs de todos los servicios a la vez, en vivo:**

```bash
docker compose logs -f
```

(`-f` = *follow*: se queda mostrando líneas nuevas en tiempo real. Para
salir sin apagar nada, `Ctrl + C`).

**Ver los logs de un solo servicio:**

```bash
docker compose logs -f backend    # solo la API
docker compose logs -f frontend   # solo Nginx / el frontend
docker compose logs -f db         # solo PostgreSQL
```

**Ver solo las últimas N líneas** (útil si no quieres el historial
completo):

```bash
docker compose logs --tail=50 backend
```

**Qué es normal ver:**

- `backend`: al arrancar, líneas de Uvicorn tipo
  `Application startup complete.` y `Uvicorn running on http://0.0.0.0:8000`.
  Luego, una línea por cada petición que llega desde el frontend
  (`GET /api/v1/especialidades HTTP/1.1 200 OK`).
- `db`: mensajes de PostgreSQL indicando que está `ready to accept connections`,
  y —solo la primera vez que se crea el volumen— la ejecución de
  `schema.sql` y `seed.sql`.
- `frontend`: prácticamente silencioso salvo por las líneas de acceso
  de Nginx cuando el navegador pide una página.

**Qué NO es normal:** tracebacks de Python (`Traceback (most recent call last)`),
`ERROR`, `FATAL`, o un contenedor que imprime lo mismo en bucle sin
avanzar (típicamente significa que se está reiniciando solo).

## 5. Verificar el backend (la API)

### 5.1 El chequeo de salud

Abre en el navegador (o usa `curl`):

```
http://localhost:8000/health
```

Debe responder inmediatamente:

```json
{ "status": "ok" }
```

Si esto no responde, el backend no está corriendo o no terminó de
arrancar — revisa `docker compose logs backend`.

### 5.2 La documentación interactiva (Swagger)

```
http://localhost:8000/docs
```

Esta página la genera FastAPI automáticamente y te deja **probar cada
endpoint sin escribir código**, directamente desde el navegador.

[INSERTAR IMAGEN: Swagger]

**Prueba rápida de login, paso a paso:**

1. Busca `POST /api/v1/auth/login` en la lista y haz clic para
   expandirlo.
2. Clic en **"Try it out"**.
3. En el cuadro de texto, reemplaza el contenido por:
   ```json
   { "email": "admin@saludya.com", "password": "Admin1234" }
   ```
4. Clic en **"Execute"**.
5. En la respuesta (**Response body**) deberías ver código `200` y un
   `access_token` largo — eso confirma que el backend, la base de
   datos y el hash de la contraseña están funcionando de punta a punta.

Puedes copiar ese `access_token` y usarlo en el botón **"Authorize"**
(candado verde arriba a la derecha de Swagger, escribiendo
`Bearer <el-token>`) para probar los endpoints que requieren sesión,
como `GET /api/v1/dashboard/stats`.

### 5.3 Desde la terminal (alternativa a Swagger)

```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saludya.com","password":"Admin1234"}'
```

## 6. Verificar la base de datos

### 6.1 Entrar a PostgreSQL desde la terminal (sin instalar nada extra)

Docker ya incluye el cliente `psql` dentro del propio contenedor de la
base de datos, así que no necesitas instalar PostgreSQL en tu
computador:

```bash
docker compose exec db psql -U saludya -d saludya
```

Deberías caer en un prompt `saludya=#`. Comandos útiles una vez adentro:

```sql
\dt                          -- lista las tablas
SELECT count(*) FROM usuarios;
SELECT count(*) FROM medicos;
SELECT nombre, apellido FROM medicos;
SELECT email, rol FROM usuarios;
\q                            -- salir
```

Si `\dt` muestra las 6 tablas (`usuarios`, `pacientes`, `medicos`,
`especialidades`, `medico_especialidad`, `citas`) y las consultas
`SELECT` devuelven filas, la base de datos está correctamente
inicializada con `schema.sql` y `seed.sql`.

### 6.2 Con un programa visual (opcional)

Si prefieres una interfaz gráfica, puedes conectar cualquier cliente
de PostgreSQL (por ejemplo [DBeaver](https://dbeaver.io/) o
[pgAdmin](https://www.pgadmin.org/), ambos gratuitos) con estos datos:

| Campo         | Valor                                                    |
| ------------- | -------------------------------------------------------- |
| Host          | `localhost`                                            |
| Puerto        | `5432`                                                 |
| Base de datos | `saludya`                                              |
| Usuario       | `saludya`                                              |
| Contraseña   | `saludya` (o el valor que hayas puesto en tu `.env`) |

## 7. Verificar el frontend (la página web)

1. Abre `http://localhost:8080` en el navegador.
2. Debe cargar la landing de SaludYa (con la ilustración animada del
   hero) sin pantalla en blanco ni errores visibles.
3. Abre las herramientas de desarrollador del navegador (`F12` en
   Chrome/Edge/Firefox) y revisa:
   - **Pestaña "Console"**: no debería haber texto en rojo (errores de
     JavaScript). Advertencias amarillas normales no son un problema.
   - **Pestaña "Network"**: recarga la página (`F5`) y busca la
     petición a `especialidades` o `medicos` — debe responder `200`,
     no `404` ni `500`. Si aquí aparece un error de conexión, el
     frontend no está encontrando al backend (revisa `VITE_API_URL` y
     que el contenedor `backend` esté `healthy`).

## 8. Prueba manual completa, de principio a fin

Este es el recorrido que demuestra que **todo el sistema funciona
integrado**, no solo cada pieza por separado:

1. Entra a `http://localhost:8080` → **Registrarme** → crea una cuenta
   de paciente nueva con un correo cualquiera.
2. Inicia sesión con esa cuenta nueva → deberías caer en "Mis citas" (vacío).
3. Ve a **Agendar cita** → elige una especialidad → elige un médico →
   elige una fecha (no domingo) y una hora → **Confirmar cita**.
4. Vuelve a **Mis citas**: la cita nueva debe aparecer en "Próximas / pendientes".
5. Cancélala desde el botón **Cancelar** → debe pasar a "Historial" con estado "Cancelada".
6. Cierra sesión. Inicia sesión ahora con la cuenta de administrador
   (`admin@saludya.com` / `Admin1234`).
7. Ve a **Dashboard** → deberías ver las métricas (citas de hoy,
   pendientes, médicos activos, pacientes registrados) con números
   reales, no en cero si ya creaste datos.
8. Ve a **Pacientes** → el paciente que creaste en el paso 1 debe
   aparecer en la lista.
9. Ve a **Médicos** → **+ Nuevo médico** → crea uno de prueba → debe
   aparecer inmediatamente en la tabla.

Si los 9 pasos funcionan sin errores en pantalla, el sistema completo
—frontend, backend, reglas de negocio y base de datos— está
funcionando correctamente de punta a punta.

## 9. Ejecutar las pruebas automatizadas

Estas son las pruebas que ya vienen escritas en el proyecto
(`backend/tests/` y `frontend/src/**/*.test.js(x)`), pensadas para
correrse **sin Docker**, directamente en tu máquina.

### 9.1 Backend (Pytest)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # en Linux/Mac: source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

**Cómo leer el resultado:**

```
tests\test_auth.py ............                                      [ 17%]
tests\test_citas.py .................x.                              [ 46%]
...
67 passed, 1 xfailed in 27.62s

Name                    Stmts   Miss  Cover
------------------------------------------
TOTAL                     725     32    96%
```

- Cada `.` es una prueba que pasó. Una `F` sería una prueba que
  **falló** (rojo, con el detalle del error justo arriba).
- `x` es una prueba marcada como `xfail` ("se espera que falle") — hay
  exactamente **una**, documentada y esperada (ver
  [`docs/fases/05-testing.md`](fases/05-testing.md)); no es un problema.
- La línea `67 passed, 1 xfailed` es el resumen: si en algún momento
  ves `X failed`, ahí sí hay un problema real que revisar (el mensaje
  de error, justo arriba de esa línea, dice exactamente qué prueba
  falló y por qué).
- La tabla de cobertura dice qué porcentaje del código quedó
  "ejercitado" por las pruebas (96% actualmente). Se genera además un
  reporte visual en `backend/htmlcov/index.html` — ábrelo con el
  navegador para ver, línea por línea, qué código sí y qué no se probó.

[INSERTAR IMAGEN: Pytest]

**Comandos útiles adicionales:**

```bash
pytest tests/test_citas.py       # solo un archivo
pytest -k "domingo"              # solo pruebas cuyo nombre contiene "domingo"
pytest -v                        # modo detallado: lista el nombre de cada prueba
```

### 9.2 Frontend (Vitest + React Testing Library)

```bash
cd frontend
npm install
npm test
```

**Cómo leer el resultado:**

```
✓ src/utils/validadores.test.js (10 tests)
✓ src/api/endpoints.test.js (9 tests)
✓ src/components/ui.test.jsx (10 tests)
✓ src/routes/ProtectedRoute.test.jsx (5 tests)
✓ src/pages/auth/LoginPage.test.jsx (3 tests)
✓ src/pages/auth/RegistroPage.test.jsx (4 tests)

 Test Files  6 passed (6)
      Tests  41 passed (41)
```

Un ✗ en vez de ✓ marca un archivo con pruebas fallidas; Vitest imprimes
justo debajo qué esperaba el test y qué recibió en realidad.

```bash
npm run test:watch      # se re-ejecuta solo al guardar un archivo (modo interactivo)
npm run test:coverage   # genera el mismo tipo de reporte de cobertura que el backend
npm run lint            # revisa el código en busca de errores/inconsistencias de estilo
```

[INSERTAR IMAGEN: Vitest]

## 10. Verificar el build de producción

Confirma que el proyecto compila sin errores para producción (lo mismo
que hace el `Dockerfile` del frontend por dentro):

```bash
cd frontend
npm run build
```

Debe terminar con `✓ built in ...s` y crear una carpeta `dist/`. Si
falla aquí, `docker compose up --build` también fallará al construir
la imagen del frontend — el error de `npm run build` es el mismo que
verías en `docker compose logs` durante el build.

## 11. Checklist rápido

Usa esta tabla como resumen antes de dar por buena una entrega o una
demo:

| Verificación                  | Comando / lugar                                                | Resultado esperado                                    |
| ------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------- |
| Contenedores arriba            | `docker compose ps`                                          | Los 3 en`Up`, `db` y `backend` en `(healthy)` |
| Backend responde               | `http://localhost:8000/health`                               | `{"status":"ok"}`                                   |
| Swagger carga                  | `http://localhost:8000/docs`                                 | Página con la lista de endpoints                     |
| Login de admin funciona        | Swagger →`POST /auth/login`                                 | `200` + `access_token`                            |
| Base de datos poblada          | `docker compose exec db psql -U saludya -d saludya -c "\dt"` | 6 tablas listadas                                     |
| Frontend carga                 | `http://localhost:8080`                                      | Landing visible, sin pantalla en blanco               |
| Consola del navegador limpia   | DevTools → Console                                            | Sin texto en rojo                                     |
| Flujo completo paciente→admin | Sección 8 de esta guía                                       | Los 9 pasos sin error                                 |
| Pruebas backend                | `pytest` (dentro de `backend/`)                            | `67 passed, 1 xfailed`                              |
| Pruebas frontend               | `npm test` (dentro de `frontend/`)                         | `41 passed`                                         |
| Lint frontend                  | `npm run lint` (dentro de `frontend/`)                     | `0 errores`                                         |
| Build de producción           | `npm run build` (dentro de `frontend/`)                    | `✓ built` sin errores                              |

## 12. Solución de problemas comunes

> 📓 Ver también [`docs/evidencias/04-bitacora-resolucion-problemas.md`](evidencias/04-bitacora-resolucion-problemas.md):
> el registro detallado, con capturas y explicación completa, de una
> sesión real de verificación en GitHub Codespaces donde aparecieron
> varios de los problemas de la tabla de abajo.

| Síntoma                                                                 | Cómo confirmarlo                                                                            | Solución                                                                                                                                                               |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker compose up --build` falla en "exporting to image" con `failed to prepare extraction snapshot ... parent snapshot ... not found` | El mensaje exacto de build de Docker | Caché de BuildKit corrupta (común en Codespaces con disco limitado). `docker builder prune -af` y volver a ejecutar `docker compose up --build` |
| `bash: frontend/: Is a directory` al intentar entrar a una carpeta | Escribiste el nombre de la carpeta solo, sin `cd` delante | Usa `cd frontend` (con el comando `cd` primero) |
| `npm test` falla con `sh: 1: vitest: not found` | No existe `frontend/node_modules/` todavía | Corre `npm install` dentro de `frontend/` antes de `npm test` |
| El navegador muestra `{"detail": "Not Found"}` al abrir el puerto 8000 | Estás visitando la URL raíz (`/`) del backend | No es un error: el backend no define ruta en `/`. Visita `/docs` (Swagger) o `/health` en esa misma URL |
| Un contenedor está en`Restarting` sin parar                           | `docker compose ps`                                                                        | `docker compose logs <servicio>` para ver el error exacto que causa el reinicio                                                                                       |
| `docker compose up` falla con "port is already allocated"              | El mensaje lo dice explícitamente (puerto 5432, 8000 u 8080 ocupado)                        | Cierra el programa que use ese puerto, o cambia`POSTGRES_PORT`/`BACKEND_PORT`/`FRONTEND_PORT` en tu `.env`                                                      |
| El frontend carga pero las páginas no traen datos                       | DevTools → pestaña Network, revisa el código de estado de las peticiones a`/api/v1/...` | Si da error de conexión: revisa que`backend` esté `(healthy)`. Si da `401`/`403`: normal si no iniciaste sesión con el rol correcto                          |
| `seed.sql` no parece haberse aplicado (tablas vacías)                 | Sección 6.1 de esta guía                                                                   | El volumen de datos ya existía de una corrida anterior —`docker compose down -v` y vuelve a levantar (esto borra los datos y los recrea desde cero)                 |
| Cambié código pero no se refleja en el navegador                       | —                                                                                           | Los contenedores de Docker usan el código*copiado durante el build*: hay que reconstruir con `docker compose up --build` (no basta con `docker compose restart`) |
| `pytest` falla con `ModuleNotFoundError: No module named 'psycopg2'` | El traceback lo indica                                                                       | No se instalaron las dependencias en el entorno activo:`pip install -r requirements-dev.txt` con el `.venv` activado                                                |
| Quiero ver qué variables de entorno recibió realmente un contenedor    | —                                                                                           | `docker compose exec backend env` (o `frontend`/`db`) lista todas las variables tal como las ve el proceso adentro                                                |
| Quiero "entrar" a un contenedor para investigar a mano                   | —                                                                                           | `docker compose exec backend bash` (Alpine/Nginx del frontend: `docker compose exec frontend sh`)                                                                   |

Ver también la tabla de solución de problemas de
[`docs/MANUAL_DESARROLLADOR.md`](MANUAL_DESARROLLADOR.md#8-solución-de-problemas-comunes),
que cubre además la puesta en marcha sin Docker.

## 13. Chuleta de comandos

```bash
# Levantar / apagar
docker compose up --build         # construir y levantar (logs en primer plano)
docker compose up --build -d      # igual, pero en segundo plano
docker compose down               # apagar (conserva los datos)
docker compose down -v            # apagar y borrar también los datos

# Estado y logs
docker compose ps                 # estado de los 3 servicios
docker compose logs -f            # logs en vivo de todos
docker compose logs -f backend    # logs en vivo de uno solo
docker compose restart backend    # reiniciar un servicio sin reconstruirlo

# Dentro de los contenedores
docker compose exec db psql -U saludya -d saludya   # consola de la base de datos
docker compose exec backend bash                     # shell dentro del backend
docker compose exec backend env                       # ver variables de entorno reales

# Pruebas (sin Docker, en tu máquina)
cd backend && pytest                       # pruebas del backend + cobertura
cd frontend && npm test                    # pruebas del frontend
cd frontend && npm run lint                # calidad de código del frontend
cd frontend && npm run build                # build de producción
```
