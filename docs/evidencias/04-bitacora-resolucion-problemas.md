# Bitácora de depuración — Verificación de Docker en GitHub Codespaces

## 0. Identificación del documento

| Campo | Detalle |
|---|---|
| **Proyecto** | SaludYa — Portal Web de Gestión Hospitalaria |
| **Tema documentado** | Problemas reales encontrados al verificar el sistema con Docker Compose en GitHub Codespaces, y cómo se resolvieron |
| **Entorno donde ocurrió** | GitHub Codespaces (`/workspaces/saludya-hospital-portal`), abierto desde el repositorio en GitHub |
| **Repositorio** | [`saludya-hospital-portal`](https://github.com/davidcamilo2005/saludya-hospital-portal) |
| **Fecha** | Agosto de 2026 |

---

## 1. Por qué existe este documento

Los documentos [`01-testing-frontend-vitest.md`](01-testing-frontend-vitest.md),
[`02-testing-backend-pytest.md`](02-testing-backend-pytest.md) y
[`03-docker-compose.md`](03-docker-compose.md) muestran el **camino feliz**:
los comandos y la salida cuando todo funciona a la primera. En la
práctica, verificar un sistema real casi nunca es tan lineal — surgen
errores de entorno, de escritura de comandos o de interpretación de
mensajes que parecen errores sin serlo. Esta bitácora documenta,
honestamente, **los problemas reales** que aparecieron al verificar
SaludYa con Docker en GitHub Codespaces, en el orden en que ocurrieron,
con el diagnóstico y la solución de cada uno. Sirve como evidencia
adicional de que el sistema fue probado a fondo, y como referencia para
cualquiera que se encuentre con los mismos síntomas.

---

## 2. Problema 1 — `docker compose up --build` falla al exportar la imagen

### Síntoma

Al ejecutar `docker compose up --build` en el Codespace, el build del
servicio `backend` llegaba hasta el paso final (`exporting to image`) y
fallaba con:

```
target backend: failed to solve: failed to prepare extraction snapshot
"extract-880693007-l2UR sha256:9396142a557edda67073a1625f4309fd83fd662b140345cd6a06580fefccadd8":
parent snapshot sha256:5e01c4f4a8c6dcae53436730c20f920d7af465a8510cbed1335f456349a4e3f
does not exist: not found
```

### Diagnóstico

Este error **no es un problema del código del proyecto** ni de los
`Dockerfile` de SaludYa — es un fallo conocido de la caché interna de
**BuildKit/containerd** (el motor que usa `docker build` por debajo):
una capa de una construcción anterior quedó referenciada por la caché,
pero el recolector de basura de Docker ya la había eliminado (algo
común en entornos con disco limitado, como el plan gratuito de
Codespaces, sobre todo tras builds interrumpidos o repetidos).

### Solución aplicada

```bash
docker builder prune -af
docker compose up --build
```

`docker builder prune -af` vacía por completo la caché de construcción
de Docker (no borra el código del proyecto ni la base de datos, solo
las capas de imágenes ya construidas), forzando a que el siguiente
`docker compose up --build` reconstruya todo desde cero sin depender
de esa caché corrupta.

**Resultado:** el build terminó correctamente y los tres contenedores
levantaron. Confirmado con:

```bash
docker compose ps
```

[INSERTAR CAPTURA: `docker compose ps` con los tres contenedores en `Up`/`healthy`, tras aplicar la solución]

### Alternativas (si el problema persiste)

```bash
docker compose down -v
docker system prune -af --volumes   # limpieza más agresiva
docker compose up --build
```

Y, como último recurso, revisar espacio en disco (`df -h`) o
reconstruir el Codespace desde la paleta de comandos de VS Code
("Codespaces: Rebuild Container").

---

## 3. Problema 2 — Confusión al entrar a la carpeta `frontend/`

### Síntoma

```
$ fronted/
bash: fronted/: No such file or directory

$ frontend/
bash: frontend/: Is a directory
```

### Diagnóstico

Dos errores de escritura de comandos, no del proyecto:

1. `fronted/` está mal escrito (falta la "n": es **front-en-d**).
2. `frontend/` sin el comando `cd` delante no es una instrucción
   válida: en una terminal, escribir solo el nombre de una carpeta
   intenta *ejecutarla* como si fuera un programa. Como es un
   directorio y no un ejecutable, bash responde `Is a directory`.

### Solución aplicada

```bash
cd frontend
```

El comando `cd` (*change directory*) es el que efectivamente cambia la
carpeta de trabajo. Después de ejecutarlo, el prompt de la terminal lo
confirma visualmente, mostrando la ruta completa:

```
@davidcamilo2005 ➜ /workspaces/saludya-hospital-portal/frontend (main) $
```

---

## 4. Problema 3 — `npm test` falla con `vitest: not found`

### Síntoma

```
$ npm test

> saludya-frontend@1.0.0 test
> vitest run

sh: 1: vitest: not found
```

### Diagnóstico

`vitest` es una dependencia del proyecto (declarada en
`frontend/package.json`), no un programa instalado en el sistema. Se
descarga dentro de la carpeta `frontend/node_modules/` únicamente
cuando se ejecuta `npm install`. Como ese paso no se había corrido
todavía en esa carpeta, `node_modules/` no existía, y por lo tanto
tampoco el ejecutable de `vitest` que `npm test` intenta llamar.

### Solución aplicada

```bash
npm install
npm test
```

`npm install` lee `frontend/package.json` y descarga las ~480
dependencias del proyecto (React, Vite, Vitest, etc.). Una vez
completado ese paso, `npm test` sí encuentra el binario de `vitest` y
corre las 41 pruebas correctamente.

[INSERTAR CAPTURA: terminal con `npm test` corriendo en verde tras el `npm install`]

---

## 5. Problema 4 — El backend responde `{"detail": "Not Found"}` en el navegador

### Síntoma

Al abrir la URL del puerto 8000 reenviado por Codespaces
(`https://<nombre-del-codespace>-8000.app.github.dev/`) directamente
en el navegador, la página mostraba:

```json
{
  "detail": "Not Found"
}
```

### Diagnóstico

**Esto no es un error**: es la respuesta estándar de FastAPI cuando se
pide una ruta que no existe. La API de SaludYa no define ninguna ruta
en `/` (la raíz) a propósito — todos sus endpoints viven bajo
`/api/v1/...`, más las rutas especiales `/health` y `/docs`. Un
`{"detail": "Not Found"}` en `/` confirma, de hecho, que el backend
**sí está corriendo y respondiendo**, solo que a la ruta equivocada.

### Solución aplicada

Visitar, en la misma URL base, las rutas que sí existen:

```
https://<nombre-del-codespace>-8000.app.github.dev/docs     ← Swagger, documentación interactiva
https://<nombre-del-codespace>-8000.app.github.dev/health   ← {"status": "ok"}
```

[INSERTAR CAPTURA: navegador mostrando `/docs` con la lista de endpoints de la API]

---

## 6. Resumen de comandos usados en esta sesión de depuración

```bash
# Problema 1: caché de Docker corrupta
docker builder prune -af
docker compose up --build
docker compose ps

# Problema 2 y 3: ubicación y dependencias del frontend
cd frontend
npm install
npm test

# Problema 4: no requirió comandos, solo cambiar la ruta en el navegador
# (agregar /docs o /health a la URL del puerto 8000)
```

## 7. Conclusión

Ninguno de los cuatro problemas de esta bitácora fue causado por un
defecto en el código o la configuración de SaludYa: fueron, en orden,
(1) una limitación conocida de la caché de Docker en un entorno de
disco limitado, y (2)-(4) pasos del flujo de trabajo (entrar a una
carpeta, instalar dependencias antes de usarlas, y elegir la ruta
correcta de la API) que son comunes al aprender a operar un proyecto
nuevo. Documentarlos aquí, con el mensaje de error exacto y la
solución exacta, deja evidencia de que el sistema se verificó a fondo
—no solo en el camino feliz— y sirve de referencia rápida si alguien
más se encuentra con los mismos síntomas.

## 8. Referencias

- [`docs/GUIA_DE_PRUEBAS.md`](../GUIA_DE_PRUEBAS.md) — guía práctica de verificación, con su propia tabla de solución de problemas comunes.
- [`03-docker-compose.md`](03-docker-compose.md) — documento formal de Docker/Docker Compose.
- Documentación oficial de BuildKit: <https://docs.docker.com/build/buildkit/>
- Documentación oficial de FastAPI sobre manejo de errores: <https://fastapi.tiangolo.com/tutorial/handling-errors/>
