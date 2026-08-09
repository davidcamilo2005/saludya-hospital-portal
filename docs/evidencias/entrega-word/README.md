# Entrega en Word — documentos formales de evidencias

Estos tres archivos `.docx` son la versión formal (portada institucional,
índice automático, texto y títulos en negro, cajas de código y de
captura de pantalla) de los documentos de evidencias que también
existen en formato Markdown en la carpeta superior
([`../01-testing-frontend-vitest.md`](../01-testing-frontend-vitest.md),
[`../02-testing-backend-pytest.md`](../02-testing-backend-pytest.md),
[`../03-docker-compose.md`](../03-docker-compose.md)).

## Cómo completarlos

1. Abre cada `.docx` en Microsoft Word (o Google Docs / LibreOffice Writer).
2. Al abrirlo, actualiza el índice: clic derecho sobre él → **"Actualizar campo"** → **"Actualizar todo el índice"**.
3. Busca las cajas amarillas marcadas **"📷 CAPTURA N: ..."** y reemplázalas por tu propia captura de pantalla, tal como describe el texto de esa caja (no borres el texto de la descripción si no quieres; puedes insertar la imagen justo debajo o encima).
4. Cuando termines, exporta a PDF: **Archivo → Guardar como/Exportar → PDF**.

## Dónde va cada captura

> **Actualización:** se agregó a los tres documentos una sección **"2.
> Descripción general del proyecto: SaludYa"** (problema que resuelve,
> qué es, módulos, stack tecnológico completo, arquitectura, "repositorio),
> antes de describir la herramienta específica de cada documento. El
> resto de secciones se corrió un número (por eso la tabla de abajo ya
> no coincide con la primera versión de este README).

### `01-Testing-Frontend-Vitest.docx`

| # | Sección | Qué debe mostrar |
|---|---|---|
| 1 | 6. Instalación | Terminal con `npm install` ya completado |
| 2 | 6. Instalación | `frontend/package.json` abierto en VS Code, bloque `devDependencies` |
| 3 | 7. Dónde se practica | Explorador de VS Code con los 6 archivos `.test.js(x)` |
| 4 | 8. Guía paso a paso | Terminal con `npm test`, resultado en verde (41 passed) |
| 5 | 8. Guía paso a paso | Navegador con el reporte HTML de cobertura |

### `02-Testing-Backend-Pytest.docx`

| # | Sección | Qué debe mostrar |
|---|---|---|
| 1 | 6. Instalación | Terminal con `pip install -r requirements-dev.txt` ya completado |
| 2 | 7. Dónde se practica | Explorador de VS Code con los 8 archivos de `backend/tests/` |
| 3 | 8. Guía paso a paso | Terminal con `pytest -v`, lista de pruebas en verde |
| 4 | 8. Guía paso a paso | Navegador con el reporte HTML de cobertura |

### `03-Docker-Compose.docx`

| # | Sección | Qué debe mostrar |
|---|---|---|
| 1 | 6.1 Instalación | Docker Desktop instalado (ícono/pantalla principal) |
| 2 | 7. Guía paso a paso | Terminal ejecutando `docker compose up --build` |
| 3 | 7. Guía paso a paso | `docker compose ps` (o Docker Desktop) con los 3 contenedores healthy |
| 4 | 7. Guía paso a paso | Navegador en `http://localhost:8080` (landing de SaludYa) |
| 5 | 7. Guía paso a paso | Navegador en `http://localhost:8000/docs` (Swagger) |
| 6 | 7. Guía paso a paso | Recorrido funcional (cita agendada, dashboard admin, etc.) |
| 7 | 7. Guía paso a paso | Terminal con el listado de las 6 tablas de la base de datos |

Este último documento es el único que **necesita** tus capturas reales
para quedar completo: los documentos 1 y 2 ya incluyen la salida real
de las pruebas como texto (transcrita literalmente de una ejecución
real), así que sus capturas son un complemento visual, no la única
evidencia.
