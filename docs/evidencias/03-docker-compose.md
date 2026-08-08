# Documento de evidencias — Contenerización con Docker y Docker Compose

## 0. Identificación del documento

| Campo | Detalle |
|---|---|
| **Proyecto** | SaludYa — Portal Web de Gestión Hospitalaria |
| **Tema documentado** | Contenerización y orquestación con **Docker** y **Docker Compose** |
| **Repositorio** | [`saludya-hospital-portal`](https://github.com/davidcamilo2005/saludya-hospital-portal) |
| **Carpeta del proyecto donde se practica este tema** | [`docker-compose.yml`](../../docker-compose.yml) (raíz), [`backend/Dockerfile`](../../backend/Dockerfile), [`frontend/Dockerfile`](../../frontend/Dockerfile), [`frontend/nginx.conf`](../../frontend/nginx.conf) |
| **Entorno de desarrollo del código** | Visual Studio Code (VS Code), sobre Windows |
| **Entorno de verificación de Docker** | Computador del estudiante, con **Docker Desktop** instalado (ver nota de la sección 2) |
| **Control de versiones** | Git + GitHub |
| **Fecha de la evidencia** | Agosto de 2026 |

---

## 1. ¿Qué son Docker y Docker Compose, y qué papel cumplen en este proyecto?

**Docker** es una plataforma de **contenerización**: empaqueta una
aplicación junto con *todo* lo que necesita para funcionar (el
lenguaje/intérprete, las librerías, la configuración del sistema
operativo) dentro de una unidad aislada llamada **contenedor**, que se
ejecuta igual en cualquier computador que tenga Docker instalado, sin
importar qué sistema operativo tenga esa máquina ni qué versiones de
software tenga instaladas de antes. Esto elimina el clásico problema
de "en mi máquina funciona, pero en la del profesor no".

**Docker Compose** es la herramienta que permite describir, en **un
solo archivo de texto** (`docker-compose.yml`), **varios contenedores
que trabajan juntos como un solo sistema** — en este proyecto: la base
de datos, el backend y el frontend — incluyendo cómo se conectan entre
sí, en qué orden deben arrancar, y qué variables de entorno recibe
cada uno. En vez de instalar y configurar PostgreSQL, Python, Node.js
y Nginx manualmente, **un solo comando** levanta el sistema completo:

```bash
docker compose up --build
```

**Por qué se usó Docker en este proyecto:** el master prompt del
proyecto lo exige explícitamente como estándar profesional de
despliegue, y es, en la práctica, la forma más confiable de garantizar
que cualquier evaluador —o cualquier desarrollador nuevo— pueda hacer
funcionar el sistema completo sin tener que instalar manualmente
PostgreSQL 15, Python 3.11 y Node.js 20 en su computador.

**Rol dentro de SaludYa:** Docker Compose es lo que convierte a este
repositorio en un sistema **reproducible de un solo comando**: une los
tres componentes (base de datos, API, interfaz web) que hasta este
punto de la documentación (ver documentos 01 y 02) se probaron **por
separado**, y los hace funcionar **juntos**, comunicándose entre sí
exactamente como lo harían en un entorno real.

---

## 2. Entorno de trabajo: por qué el código se probó con Docker en otra máquina

> **Esta es una aclaración importante y honesta sobre cómo se
> construyó y verificó este proyecto**, no un detalle menor.

El código de este proyecto (backend, frontend, `docker-compose.yml`,
ambos `Dockerfile`) se **escribió y organizó en Visual Studio Code**,
en un entorno de desarrollo que **no tenía Docker Desktop instalado**.
Por esa razón:

1. Las pruebas automatizadas de backend y frontend (documentos
   [`02-testing-backend-pytest.md`](02-testing-backend-pytest.md) y
   [`01-testing-frontend-vitest.md`](01-testing-frontend-vitest.md))
   se diseñaron **a propósito** para poder ejecutarse sin Docker
   (Pytest contra SQLite en memoria, Vitest con mocks de la API), y sí
   se ejecutaron y verificaron directamente en ese entorno, con
   evidencia real capturada.
2. Para poder probar Docker Compose en sí —que sí requiere Docker
   instalado—, el proyecto se subió a **GitHub**
   (`https://github.com/davidcamilo2005/saludya-hospital-portal`) y se
   clonó desde ahí en un **computador que sí tiene Docker Desktop
   instalado**, donde se ejecutó `docker compose up --build` y se
   confirmó que la aplicación cargaba correctamente en el navegador.

Este es, de hecho, uno de los usos más comunes de Git y GitHub en un
flujo de trabajo profesional: **desarrollar en un entorno y verificar
en otro**, usando el repositorio remoto como punto de sincronización
en lugar de copiar archivos manualmente entre computadores.

---

## 3. Qué se instaló y cómo se incluyó en el proyecto

### 3.1 Instalación de Docker Desktop

Docker Desktop se descarga gratuitamente desde
<https://www.docker.com/products/docker-desktop/> (incluye Docker
Engine, Docker Compose y una interfaz gráfica). Tras instalarlo, debe
quedar **abierto y corriendo** (ícono de la ballena 🐳 activo en la
barra de tareas) antes de usar cualquier comando `docker`.

[INSERTAR CAPTURA: Docker Desktop instalado, ícono en la barra de tareas / pantalla principal de la aplicación]

### 3.2 Cómo se incluyó Docker en el proyecto (archivos de configuración)

A diferencia de Pytest o Vitest, Docker no se "instala" dentro del
código del proyecto: se **describe** mediante archivos de
configuración versionados en Git, que cualquiera que clone el
repositorio puede usar sin instalar nada más que Docker Desktop:

| Archivo | Qué describe |
|---|---|
| [`docker-compose.yml`](../../docker-compose.yml) | Los tres servicios (`db`, `backend`, `frontend`), sus puertos, variables de entorno, healthchecks y el orden de arranque. |
| [`backend/Dockerfile`](../../backend/Dockerfile) | Cómo construir la imagen del backend: parte de `python:3.11-slim`, instala las dependencias del sistema y de `requirements.txt`, copia el código y define cómo arrancarlo (`uvicorn`). |
| [`frontend/Dockerfile`](../../frontend/Dockerfile) | Cómo construir la imagen del frontend en **dos etapas**: primero compila el proyecto React con Node.js (`npm run build`), y luego copia *solo* el resultado (archivos estáticos) a una imagen liviana de Nginx. |
| [`frontend/nginx.conf`](../../frontend/nginx.conf) | Cómo Nginx debe servir esos archivos estáticos y redirigir las peticiones `/api/*` hacia el contenedor del backend. |
| [`.env.example`](../../.env.example) | Plantilla de las variables de entorno que Docker Compose inyecta a los tres servicios (usuario/contraseña de PostgreSQL, clave secreta de JWT, puertos). |
| [`database/schema.sql`](../../database/schema.sql) y [`database/seed.sql`](../../database/seed.sql) | Se montan dentro del contenedor de PostgreSQL y se ejecutan automáticamente la primera vez que se crea su volumen de datos. |

---

## 4. Cómo se ejecuta el sistema completo (paso a paso)

```bash
git clone https://github.com/davidcamilo2005/saludya-hospital-portal.git
cd saludya-hospital-portal

cp .env.example .env
# (opcional) abrir .env y ajustar valores, especialmente JWT_SECRET_KEY

docker compose up --build
```

Explicación de cada parte del comando:

- `docker compose` invoca la herramienta de orquestación.
- `up` levanta (crea y arranca) los servicios descritos en `docker-compose.yml`.
- `--build` fuerza a construir las imágenes de `backend` y `frontend`
  desde cero a partir de sus respectivos `Dockerfile` antes de
  arrancarlas (necesario la primera vez, y cada vez que cambie el
  código o las dependencias).

Otros comandos usados durante la verificación:

```bash
docker compose ps               # ver el estado de los tres servicios
docker compose logs -f backend  # ver los registros (logs) del backend en vivo
docker compose down             # apagar todo (conserva los datos)
docker compose down -v          # apagar y borrar también los datos (reinicio total)
```

Guía extendida, con más comandos y solución de problemas, en
[`docs/GUIA_DE_PRUEBAS.md`](../GUIA_DE_PRUEBAS.md).

---

## 5. Evidencia de la ejecución

> **Nota de transparencia:** a diferencia de los documentos 01
> (Vitest) y 02 (Pytest) de esta misma carpeta —donde la salida
> mostrada es la transcripción literal de una ejecución real hecha
> directamente para esta documentación—, **Docker no estaba disponible
> en el entorno donde se preparó este documento**. Lo que sigue en
> esta sección es: (a) el resultado que el **propio código de este
> repositorio** produce necesariamente al ejecutarse —porque se deduce
> directamente de `docker-compose.yml` y de los `Dockerfile`, no es una
> invención—, y (b) los espacios exactos donde deben insertarse las
> capturas de pantalla **reales**, tomadas por el estudiante en su
> propio computador con Docker Desktop, donde el sistema **sí se
> ejecutó y se confirmó visualmente que la aplicación cargaba
> correctamente**.

### 5.1 Estado esperado de los contenedores (`docker compose ps`)

Según los nombres de servicio, imágenes y puertos definidos en
`docker-compose.yml`, la salida de este comando, con el sistema
arriba y saludable, tiene esta forma:

```
NAME               IMAGE                 STATUS                    PORTS
saludya_db         postgres:15-alpine    Up X minutes (healthy)    0.0.0.0:5432->5432/tcp
saludya_backend     saludya-backend       Up X minutes (healthy)    0.0.0.0:8000->8000/tcp
saludya_frontend    saludya-frontend      Up X minutes              0.0.0.0:8080->80/tcp
```

[INSERTAR CAPTURA REAL: salida de `docker compose ps` en la terminal del estudiante]

[INSERTAR CAPTURA REAL: Docker Desktop → pestaña "Containers", mostrando el grupo `saludya` con los tres contenedores en verde]

### 5.2 Verificación del backend dentro de Docker

Con el sistema arriba, `http://localhost:8000/health` debe responder:

```json
{ "status": "ok" }
```

y `http://localhost:8000/docs` debe mostrar la documentación
interactiva de Swagger (idéntica en estructura a la usada en el
documento 02, ahora sirviendo desde dentro del contenedor en lugar de
un entorno virtual local).

[INSERTAR CAPTURA REAL: navegador mostrando `http://localhost:8000/docs` con la API corriendo desde Docker]

### 5.3 Verificación del frontend dentro de Docker

`http://localhost:8080` debe mostrar la landing de SaludYa, servida
por **Nginx** desde los archivos estáticos generados por
`npm run build` dentro del contenedor `frontend` — el mismo build que
se verificó de forma aislada en el documento 01.

[INSERTAR CAPTURA REAL: navegador mostrando la landing de SaludYa en `http://localhost:8080`]

[INSERTAR CAPTURA REAL: recorrido funcional — login, agendar una cita, panel de administrador — confirmando que frontend, backend y base de datos funcionan integrados dentro de Docker]

### 5.4 Verificación de la base de datos dentro de Docker

```bash
docker compose exec db psql -U saludya -d saludya -c "\dt"
```

Debe listar las 6 tablas del modelo (`usuarios`, `pacientes`,
`medicos`, `especialidades`, `medico_especialidad`, `citas`),
confirmando que `database/schema.sql` se ejecutó correctamente al
crearse el volumen de PostgreSQL, y:

```bash
docker compose exec db psql -U saludya -d saludya -c "SELECT email, rol FROM usuarios;"
```

Debe devolver, como mínimo, las dos cuentas de demostración sembradas
por `database/seed.sql` (`admin@saludya.com` y `paciente@saludya.com`).

[INSERTAR CAPTURA REAL: terminal mostrando el resultado de estos dos comandos]

---

## 6. Interpretación de resultados — cómo leer la salida

| Elemento | Qué significa |
|---|---|
| `Up X minutes (healthy)` | El contenedor no solo está encendido: además pasó su `HEALTHCHECK` (para `db`, que PostgreSQL acepta conexiones; para `backend`, que `GET /health` responde `200`). |
| `Up X minutes` (sin "healthy") | El contenedor está corriendo, pero no tiene un healthcheck configurado — es el caso esperado de `frontend`, no una falla. |
| `Restarting` en bucle | El proceso principal del contenedor está fallando y Docker lo reinicia una y otra vez; el motivo exacto aparece en `docker compose logs <servicio>`. |
| Código `200` en `/health` o `/docs` | El backend recibió la petición y respondió correctamente. |
| Página cargando en `localhost:8080` | Nginx está sirviendo el build de React correctamente y (si las páginas muestran datos) el proxy hacia el backend también funciona. |

---

## 7. Relación con el resto del proyecto

Este documento cierra el ciclo de verificación que empiezan los
documentos 01 y 02: Vitest y Pytest prueban **cada parte por
separado**, de forma rápida y sin depender de infraestructura externa;
Docker Compose prueba que esas mismas partes, ya *construidas* como
imágenes de producción, **funcionan integradas** entre sí y con una
base de datos PostgreSQL real —incluyendo el detalle que SQLite no
podía validar en el documento 02: el índice único parcial que impide
la doble reserva de citas—.

## 8. Conclusión

Docker y Docker Compose cumplen en SaludYa el papel de **empaquetar y
orquestar el sistema completo** para que cualquier persona —un
compañero, un evaluador, un futuro desarrollador— pueda ejecutarlo con
un solo comando, sin instalar PostgreSQL, Python ni Node.js
manualmente, y sin importar el sistema operativo que use. La
verificación de esta pieza se realizó de forma coherente con cómo se
usa Docker en la práctica profesional: el código se desarrolló en un
entorno, se subió a GitHub, y se ejecutó/confirmó en otro entorno que
sí contaba con Docker Desktop instalado — quedando pendiente
únicamente completar los espacios de captura de pantalla marcados en
la sección 5 con la evidencia visual de esa ejecución.

## 9. Referencias

- Documentación oficial de Docker: <https://docs.docker.com/>
- Documentación oficial de Docker Compose: <https://docs.docker.com/compose/>
- Documentación oficial de Nginx: <https://nginx.org/en/docs/>
- [`docs/fases/06-docker.md`](../fases/06-docker.md) — planificación y cierre formal de la fase de contenerización.
- [`docs/GUIA_DE_PRUEBAS.md`](../GUIA_DE_PRUEBAS.md) — guía extendida de verificación de todo el sistema.
