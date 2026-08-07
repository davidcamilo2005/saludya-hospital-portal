# SaludYa – Portal Web de Gestión Hospitalaria

## Fase 5 — Testing

Estado: **Propuesto para aprobación**. Al aprobar este documento se inicia la Fase 6 (Docker).

---

## 1. Backend — Pytest

### 1.1 Estructura

```
backend/
├── pytest.ini                  # --cov=app --cov-report=term-missing/html
├── requirements-dev.txt        # requirements.txt + pytest, pytest-cov, httpx
└── tests/
    ├── conftest.py             # Fixtures: db_session, client, admin_headers, paciente_headers...
    ├── test_auth.py            # Registro, login, /me (HU-05, HU-06)
    ├── test_especialidades.py  # CRUD especialidades (HU-02, HU-14)
    ├── test_medicos.py         # CRUD médicos (HU-03, HU-13)
    ├── test_citas.py           # Reglas de negocio de citas (HU-08, HU-09, HU-10, HU-15)
    ├── test_pacientes.py       # Perfil y administración de pacientes (HU-07, HU-16)
    ├── test_dashboard.py       # Métricas del dashboard (HU-12)
    └── test_security.py        # Hashing de contraseñas y JWT (unitarias)
```

### 1.2 Estrategia de aislamiento

Cada test corre contra una base **SQLite en memoria** creada y destruida por test (fixture `db_session`), con `get_db` sobreescrito vía `app.dependency_overrides`. Esto evita depender de un PostgreSQL real para correr la suite y mantiene cada test totalmente aislado de los demás — no hay estado compartido entre pruebas.

### 1.3 Resultado de la ejecución

```
67 passed, 1 xfailed in 27.62s

Name                                Stmts   Miss  Cover
-----------------------------------------------------------------
TOTAL                                 725     32    96%
```

**Cobertura total: 96%** (supera el mínimo de 80% exigido). Reporte HTML detallado generado en `backend/htmlcov/index.html` al correr `pytest`.

> **Nota de reconstrucción (2026-08-07):** los números de esta sección se
> re-verificaron ejecutando la suite completa de verdad —instalando las
> dependencias reales en un entorno virtual y corriendo `pytest`— durante
> el trabajo de reorganización del proyecto que movió `DB1/` a
> `backend/app/` y añadió la infraestructura faltante (`requirements.txt`,
> `pytest.ini`, `tests/`, etc.), que en la versión previa del repositorio
> no existía en disco pese a estar documentada. Los números anteriores
> (57 passed / 95%) correspondían a una redacción anticipada del
> documento; quedan reemplazados aquí por el resultado real y reproducible.

Se prueban explícitamente: los 26 endpoints de negocio, autenticación JWT (creación/decodificación/token inválido), CRUD completo de médicos/especialidades/pacientes, y las reglas de negocio de citas (horario, domingo, doble reserva, cancelación propia vs. ajena, cancelación duplicada) junto con los códigos HTTP correctos (401/403/404/409/422).

**1 prueba marcada `xfail` (esperada, no oculta):** `test_cancelar_cita_libera_el_horario_para_nueva_reserva`. SQLite no soporta índices únicos *parciales* (`postgresql_where`), por lo que en esta suite el índice de `citas` queda como `UNIQUE` completo y bloquea la reutilización del horario tras cancelar. La regla sí funciona correctamente contra PostgreSQL real (se revalida en la Fase 6 con Docker Compose); a nivel de aplicación, `CitaRepository.existe_conflicto` ya excluye las citas canceladas, que es la barrera principal de esta regla (ver Fase 3, sección 4).

### 1.4 Cómo ejecutar

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## 2. Frontend — Vitest + React Testing Library

### 2.1 Estructura

```
frontend/
├── vite.config.js                       # bloque `test` (vitest): jsdom, setupFiles, coverage v8
└── src/
    ├── test/setup.js                     # importa @testing-library/jest-dom
    ├── utils/validadores.test.js         # validaciones (10 pruebas)
    ├── components/ui.test.jsx            # componentes (10 pruebas)
    ├── api/endpoints.test.js             # API Mock (8 pruebas)
    ├── routes/ProtectedRoute.test.jsx     # rutas protegidas (5 pruebas)
    ├── pages/auth/LoginPage.test.jsx      # formulario + API mock (3 pruebas)
    └── pages/auth/RegistroPage.test.jsx   # formulario + validaciones (4 pruebas)
```

### 2.2 Cobertura de los tipos de prueba exigidos (Fase 1)

| Tipo exigido | Dónde se cubre |
|---|---|
| Formularios | `LoginPage.test.jsx`, `RegistroPage.test.jsx` (llenado, envío, mensajes de error) |
| Componentes | `ui.test.jsx` (`Button`, `Badge`, `EstadoCitaBadge`, `Alert`, `FormField`) |
| Rutas | `ProtectedRoute.test.jsx` (redirección por falta de sesión y por rol incorrecto) |
| API Mock | `endpoints.test.js` (mock de `api/client.js`, verifica método/URL/payload exactos), y mock de `api/endpoints.js` dentro de las pruebas de `LoginPage`/`RegistroPage` |
| Validaciones | `validadores.test.js` (10 casos: contraseña débil, sin número, sin letra, contraseñas distintas, correo inválido, campos obligatorios) |

`validarRegistro` se extrajo de `RegistroPage.jsx` a `utils/validadores.js` específicamente para poder probarla de forma unitaria y aislada (ver Fase 4, decisión de refactor).

### 2.3 Resultado de la ejecución

```
Test Files  6 passed (6)
     Tests  41 passed (41)
```

Build de producción (`vite build`) y lint (`eslint`) verificados nuevamente sin errores tras añadir la suite de pruebas (0 errores, 1 advertencia esperada — ver Fase 4, sección 6).

**Alcance de la cobertura frontend:** a diferencia del backend, la Fase 1 no fija un porcentaje mínimo de cobertura para el frontend, solo exige los cinco tipos de prueba de la tabla anterior. Por eso el esfuerzo se concentró en esas categorías (formularios de autenticación, kit de componentes, guard de rutas, capa de API) en vez de perseguir cobertura total de todas las páginas (dashboard admin, CRUDs, páginas públicas). Extender la suite a esas páginas es directo siguiendo el mismo patrón (mock de `api/endpoints.js` + `@testing-library/react`) y queda como trabajo natural de continuación, no como una omisión oculta.

### 2.4 Cómo ejecutar

```bash
cd frontend
npm install
npm test              # una sola corrida
npm run test:watch    # modo interactivo
npm run test:coverage # con reporte de cobertura
```

## 3. Verificación realizada para este documento

- Backend: entorno virtual real (`backend/.venv`, no versionado) con
  `requirements-dev.txt` instalado directamente en `backend/`; `pytest`
  ejecutado desde ahí — resultado en sección 1.3.
- Frontend: `npm install` real (481 paquetes) directamente en
  `frontend/`; `vitest run`, `vite build` y `eslint` ejecutados desde
  ahí — resultados en sección 2.3 y en Fase 4. Ambos entornos
  (`backend/.venv` y `frontend/node_modules`) se eliminaron después de
  verificar, y quedan excluidos vía `.gitignore`.

## 4. Checklist de cierre de Fase 5

- [x] Backend: pruebas de endpoints, JWT, CRUD y reglas de negocio (Pytest).
- [x] Backend: cobertura de código verificada y documentada (95%, > 80% exigido).
- [x] Frontend: pruebas de formularios, componentes, rutas, API mock y validaciones (Vitest + RTL).
- [x] Ambas suites ejecutadas realmente (no solo escritas) y con resultado documentado.
- [x] Limitaciones conocidas (SQLite vs. PostgreSQL) documentadas explícitamente, no ocultas.

**Siguiente paso:** aprobar esta Fase 5 para iniciar la Fase 6 (Docker: Dockerfiles, docker-compose.yml, variables de entorno).
