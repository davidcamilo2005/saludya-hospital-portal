# Documento de evidencias — Testing de Backend con Pytest

## 0. Identificación del documento

| Campo | Detalle |
|---|---|
| **Proyecto** | SaludYa — Portal Web de Gestión Hospitalaria |
| **Tema documentado** | Pruebas automatizadas del **Backend** (API) con **Pytest** |
| **Repositorio** | [`saludya-hospital-portal`](https://github.com/davidcamilo2005/saludya-hospital-portal) |
| **Carpeta del proyecto donde se practica este tema** | [`backend/`](../../backend), específicamente [`backend/tests/`](../../backend/tests) y [`backend/pytest.ini`](../../backend/pytest.ini) |
| **Entorno de desarrollo** | Visual Studio Code (VS Code), sobre Windows |
| **Control de versiones** | Git + GitHub |
| **Fecha de la evidencia** | Agosto de 2026 |

---

## 1. Descripción general del proyecto: SaludYa

Antes de describir la herramienta específica de este documento, es
necesario describir el proyecto sobre el cual se aplica, ya que las
pruebas no tienen sentido por sí solas: existen para verificar un
sistema real.

### 1.1 Problema que resuelve

Actualmente, muchas personas deben acudir físicamente a un hospital
únicamente para realizar trámites administrativos sencillos: solicitar
una cita, consultarla, cancelarla, o simplemente conocer los horarios
y especialidades disponibles. Esto provoca congestión en las
instalaciones, filas largas, pérdida de tiempo para el paciente,
retrasos en la atención y sobrecarga del personal administrativo —
recursos que podrían concentrarse en pacientes que realmente requieren
atención presencial.

### 1.2 Qué es SaludYa

**SaludYa — Portal Web de Gestión Hospitalaria** es un sistema web que
digitaliza esos trámites administrativos: permite a un paciente
registrarse, iniciar sesión, y agendar, consultar y cancelar sus citas
médicas en línea; y permite a un administrador del hospital gestionar
médicos, especialidades y el flujo completo de citas desde un panel
propio. El sistema aplica reglas reales de negocio de un hospital:
horario de atención (7:00 a. m. a 5:00 p. m.), prohibición de citas
los domingos, y la imposibilidad de que un mismo médico tenga dos
citas activas a la misma fecha y hora.

### 1.3 Módulos del sistema

| Módulo | Funcionalidades |
|---|---|
| Público | Landing institucional, historia/misión/visión, listado de especialidades, listado de médicos, contacto, preguntas frecuentes. |
| Paciente | Registro, inicio de sesión, edición de perfil, agendar cita (validando horario, día y disponibilidad del médico), consultar citas (pendientes e historial) y cancelarlas. |
| Administrador | Dashboard con métricas en tiempo real, CRUD de médicos, CRUD de especialidades, gestión y cancelación de cualquier cita, administración de pacientes. |

### 1.4 Stack tecnológico completo del proyecto

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Axios, React Router, Vitest, React Testing Library |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2, Pydantic v2, python-jose (JWT), passlib (bcrypt), Alembic, Pytest |
| Base de datos | PostgreSQL 15, normalizada hasta 3FN |
| DevOps | Docker, Docker Compose, Nginx (reverse proxy + SPA), Git, GitHub |

Este documento se enfoca específicamente en el **backend**; el
frontend y la contenerización con Docker se documentan, con el mismo
nivel de detalle, en
[`01-testing-frontend-vitest.md`](01-testing-frontend-vitest.md) y
[`03-docker-compose.md`](03-docker-compose.md).

## 2. ¿Qué es Pytest y qué papel cumple en este proyecto?

**Pytest** es el **framework de pruebas automatizadas** más usado del
ecosistema Python. Su función es descubrir automáticamente archivos y
funciones de prueba (cualquier archivo `test_*.py`, cualquier función
`def test_*()`), ejecutarlas, y reportar cuáles pasaron y cuáles
fallaron, con el detalle exacto del error cuando algo no coincide con
lo esperado.

**Por qué se eligió Pytest** (sobre el módulo `unittest` incluido en
Python): su sintaxis es más simple (`assert` normal, sin clases
obligatorias ni métodos `assertEqual`), y su sistema de **fixtures**
(funciones reutilizables que preparan datos o recursos para las
pruebas, como una base de datos limpia o un usuario autenticado) es
mucho más flexible y es, además, el estándar de facto en proyectos
FastAPI.

**Rol dentro de SaludYa:** Pytest es la herramienta que demuestra,
de forma objetiva y repetible, que la **lógica de negocio real** del
hospital funciona: que no se pueden agendar citas en domingo, que un
médico no puede tener dos citas activas al mismo tiempo, que solo un
administrador puede gestionar médicos, que las contraseñas se
protegen correctamente, etc. — probando los 26 endpoints reales de la
API, no una versión simplificada.

---

## 3. Entorno de trabajo y cómo se instaló

### 3.1 Dónde se desarrolló

El backend (FastAPI + SQLAlchemy + las pruebas de este documento) se
escribió en **Visual Studio Code**, sobre Windows, y se versionó con
**Git**, subiéndose a **GitHub** en
`https://github.com/davidcamilo2005/saludya-hospital-portal`.

> **Nota importante sobre el entorno:** estas pruebas se ejecutaron
> **directamente sobre Python**, con un entorno virtual (`venv`)
> creado en la máquina de desarrollo — **sin Docker**. Esto es a
> propósito: Pytest está pensado para el ciclo rápido de
> desarrollo/prueba, y para no depender de un PostgreSQL real, la
> suite corre contra una base de datos **SQLite en memoria** (ver
> sección 4.2). Docker entra en juego después, para levantar el sistema
> completo con PostgreSQL de verdad (documentado en
> [`03-docker-compose.md`](03-docker-compose.md)). De hecho, Docker no
> estaba disponible en todos los entornos usados durante el
> desarrollo de este proyecto — una de las razones concretas por las
> que se subió a GitHub fue justamente para poder probarlo también en
> una máquina con Docker Desktop instalado.

### 3.2 Qué se descargó y cómo se incluyó en el proyecto

Igual que en el frontend, Pytest no se instala "suelto": está
declarado como dependencia dentro de
[`backend/requirements-dev.txt`](../../backend/requirements-dev.txt),
que a su vez incluye todas las dependencias de producción
(`requirements.txt`) más las de prueba:

```
-r requirements.txt

pytest==8.3.3
pytest-cov==5.0.0
httpx==0.27.2
```

| Paquete | Para qué sirve |
|---|---|
| `pytest` | El motor que descubre, ejecuta y reporta las pruebas. |
| `pytest-cov` | Genera el reporte de cobertura de código (integra la librería `coverage.py` con Pytest). |
| `httpx` | Cliente HTTP que usa internamente `TestClient` de FastAPI para simular peticiones a la API sin necesitar un servidor real corriendo. |

**Comandos de instalación y ejecución** (paso a paso):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # en Linux/Mac: source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

[INSERTAR CAPTURA: terminal de VS Code mostrando `pip install -r requirements-dev.txt` completado]

La configuración de Pytest vive en
[`backend/pytest.ini`](../../backend/pytest.ini):

```ini
[pytest]
addopts = --cov=app --cov-report=term-missing --cov-report=html
testpaths = tests
pythonpath = .
filterwarnings =
    ignore::DeprecationWarning
```

Esto hace que **con solo escribir `pytest`**, sin ningún parámetro
adicional, ya se ejecute toda la suite **con** reporte de cobertura
automáticamente.

---

## 4. Dónde y cómo se está practicando este tema en el proyecto

### 4.1 Estructura de la suite

```
backend/tests/
├── conftest.py             # Fixtures compartidas (ver 3.2)
├── test_security.py         # Hashing de contraseñas y JWT (unitarias)
├── test_auth.py              # Registro, login, /me
├── test_especialidades.py    # CRUD de especialidades
├── test_medicos.py            # CRUD de médicos
├── test_citas.py               # Reglas de negocio de citas (la más extensa)
├── test_pacientes.py            # Perfil y administración de pacientes
└── test_dashboard.py             # Métricas del panel administrativo
```

### 4.2 Estrategia de aislamiento: ¿por qué SQLite y no PostgreSQL?

Cada prueba corre contra una base de datos **SQLite en memoria**,
creada desde cero y destruida al terminar cada prueba individual (ver
fixture `db_session` en
[`backend/tests/conftest.py`](../../backend/tests/conftest.py)). El
`get_db` real de la aplicación se reemplaza temporalmente por uno que
entrega esa base de prueba (`app.dependency_overrides[get_db] = ...`).

**Ventaja de este enfoque:** la suite completa corre en segundos, sin
necesitar un PostgreSQL instalado ni levantado, y cada prueba está
totalmente aislada de las demás (no hay datos que "se filtren" de una
prueba a otra). **Limitación conocida y documentada:** SQLite no
soporta *índices únicos parciales* como el que usa
`database/schema.sql` para la regla "no dos citas activas en el mismo
horario"; esto produce exactamente **una** prueba marcada como
`xfail` (fallo esperado, ver sección 6).

### 4.3 Fixtures reutilizables (extracto de `conftest.py`)

```python
@pytest.fixture()
def client(db_session):
    def _override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture()
def admin_headers(admin_usuario):
    token = create_access_token(subject=str(admin_usuario.id), rol="administrador")
    return {"Authorization": f"Bearer {token}"}
```

Estas fixtures se **inyectan por nombre** en cualquier función de
prueba (`def test_algo(client, admin_headers): ...`), evitando repetir
la misma preparación en cada una de las 68 pruebas.

---

## 5. Cómo se ejecutan las pruebas (paso a paso)

```bash
cd backend
pytest                       # toda la suite, con cobertura (ya viene en pytest.ini)
pytest -v                    # modo detallado: lista el nombre de cada prueba
pytest tests/test_citas.py    # solo un archivo puntual
pytest -k "domingo"           # solo las pruebas cuyo nombre contiene "domingo"
```

Al terminar, además del resumen en la terminal, queda un reporte
visual en `backend/htmlcov/index.html` (no se versiona en Git; se
regenera cada vez que se corre `pytest`).

---

## 6. Evidencia real de la ejecución (salida obtenida)

> La salida que sigue es la **transcripción textual real** de haber
> instalado las dependencias desde cero en un entorno virtual limpio y
> ejecutado `pytest -v --cov=app --cov-report=term-missing` contra el
> código actual del repositorio — no una simulación.

[INSERTAR CAPTURA: terminal de VS Code ejecutando `pytest`, con el resumen final en verde]

### 6.1 Resultado de `pytest -v --cov=app --cov-report=term-missing`

```
testpaths: tests
plugins: anyio-4.14.2, cov-7.1.0
collecting ... collected 68 items

tests/test_auth.py::test_registrar_paciente_exitoso PASSED               [  1%]
tests/test_auth.py::test_registrar_correo_duplicado PASSED               [  2%]
tests/test_auth.py::test_registrar_documento_duplicado PASSED            [  4%]
tests/test_auth.py::test_registrar_password_sin_numero_es_rechazada PASSED [  5%]
tests/test_auth.py::test_registrar_password_sin_letra_es_rechazada PASSED [  7%]
tests/test_auth.py::test_registrar_password_corta_es_rechazada PASSED    [  8%]
tests/test_auth.py::test_registrar_email_invalido_es_rechazado PASSED    [ 10%]
tests/test_auth.py::test_login_exitoso PASSED                            [ 11%]
tests/test_auth.py::test_login_password_incorrecta PASSED                [ 13%]
tests/test_auth.py::test_login_usuario_inexistente PASSED                [ 14%]
tests/test_auth.py::test_me_sin_token_devuelve_401 PASSED                [ 16%]
tests/test_auth.py::test_me_con_token_valido PASSED                      [ 17%]
tests/test_auth.py::test_me_con_token_invalido_devuelve_401 PASSED       [ 19%]
tests/test_citas.py::test_agendar_cita_exitosa PASSED                    [ 20%]
tests/test_citas.py::test_agendar_cita_sin_token_devuelve_401 PASSED     [ 22%]
tests/test_citas.py::test_agendar_cita_como_admin_devuelve_403 PASSED    [ 23%]
tests/test_citas.py::test_agendar_cita_en_domingo_es_rechazada PASSED    [ 25%]
tests/test_citas.py::test_agendar_cita_fuera_de_horario_es_rechazada PASSED [ 26%]
tests/test_citas.py::test_agendar_cita_medico_no_practica_la_especialidad PASSED [ 27%]
tests/test_citas.py::test_agendar_cita_medico_inexistente_devuelve_404 PASSED [ 29%]
tests/test_citas.py::test_no_permite_doble_reserva_mismo_medico_y_horario PASSED [ 30%]
tests/test_citas.py::test_mis_citas_devuelve_solo_las_del_paciente_autenticado PASSED [ 32%]
tests/test_citas.py::test_cancelar_cita_propia PASSED                    [ 33%]
tests/test_citas.py::test_cancelar_cita_ya_cancelada_devuelve_409 PASSED [ 35%]
tests/test_citas.py::test_cancelar_cita_ajena_devuelve_403 PASSED        [ 36%]
tests/test_citas.py::test_cancelar_cita_libera_el_horario_para_nueva_reserva XFAIL [ 38%]
tests/test_citas.py::test_admin_lista_todas_las_citas_con_filtro_de_estado PASSED [ 39%]
tests/test_citas.py::test_admin_lista_citas_requiere_rol_admin PASSED    [ 41%]
tests/test_citas.py::test_admin_cancela_cualquier_cita PASSED            [ 42%]
tests/test_dashboard.py::test_dashboard_requiere_token PASSED            [ 44%]
tests/test_dashboard.py::test_dashboard_requiere_rol_admin PASSED        [ 45%]
tests/test_dashboard.py::test_dashboard_estructura_de_respuesta PASSED   [ 47%]
tests/test_dashboard.py::test_dashboard_refleja_citas_y_medicos_creados PASSED [ 48%]
tests/test_especialidades.py::test_listado_publico_solo_incluye_activas PASSED [ 50%]
tests/test_especialidades.py::test_obtener_especialidad_por_id PASSED    [ 51%]
tests/test_especialidades.py::test_obtener_especialidad_inexistente_devuelve_404 PASSED [ 52%]
tests/test_especialidades.py::test_listar_todas_admin_requiere_rol_admin PASSED [ 54%]
tests/test_especialidades.py::test_listar_todas_admin_sin_token_devuelve_401 PASSED [ 55%]
tests/test_especialidades.py::test_crear_especialidad_como_admin PASSED  [ 57%]
tests/test_especialidades.py::test_crear_especialidad_nombre_duplicado PASSED [ 58%]
tests/test_especialidades.py::test_crear_especialidad_como_paciente_devuelve_403 PASSED [ 60%]
tests/test_especialidades.py::test_actualizar_especialidad PASSED        [ 61%]
tests/test_especialidades.py::test_desactivar_especialidad_sin_medicos_asociados PASSED [ 63%]
tests/test_especialidades.py::test_desactivar_especialidad_con_medico_activo_devuelve_409 PASSED [ 64%]
tests/test_medicos.py::test_listado_publico_solo_incluye_activos PASSED  [ 66%]
tests/test_medicos.py::test_obtener_medico_incluye_especialidades PASSED [ 67%]
tests/test_medicos.py::test_crear_medico_como_admin PASSED               [ 69%]
tests/test_medicos.py::test_crear_medico_sin_especialidades_devuelve_422 PASSED [ 70%]
tests/test_medicos.py::test_crear_medico_con_especialidad_inexistente_devuelve_404 PASSED [ 72%]
tests/test_medicos.py::test_crear_medico_documento_duplicado PASSED      [ 73%]
tests/test_medicos.py::test_crear_medico_como_paciente_devuelve_403 PASSED [ 75%]
tests/test_medicos.py::test_actualizar_medico_cambia_especialidades PASSED [ 76%]
tests/test_medicos.py::test_desactivar_medico PASSED                     [ 77%]
tests/test_pacientes.py::test_obtener_mi_perfil PASSED                   [ 79%]
tests/test_pacientes.py::test_obtener_mi_perfil_como_admin_devuelve_403 PASSED [ 80%]
tests/test_pacientes.py::test_actualizar_mi_perfil PASSED                [ 82%]
tests/test_pacientes.py::test_listar_pacientes_como_admin PASSED         [ 83%]
tests/test_pacientes.py::test_listar_pacientes_como_paciente_devuelve_403 PASSED [ 85%]
tests/test_pacientes.py::test_obtener_paciente_por_id_como_admin PASSED  [ 86%]
tests/test_pacientes.py::test_obtener_paciente_inexistente_devuelve_404 PASSED [ 88%]
tests/test_pacientes.py::test_desactivar_paciente_como_admin PASSED      [ 89%]
tests/test_pacientes.py::test_paciente_desactivado_no_puede_iniciar_sesion PASSED [ 91%]
tests/test_security.py::test_hash_password_no_devuelve_texto_plano PASSED [ 92%]
tests/test_security.py::test_verify_password_correcta PASSED             [ 94%]
tests/test_security.py::test_verify_password_incorrecta PASSED           [ 95%]
tests/test_security.py::test_create_and_decode_access_token PASSED       [ 97%]
tests/test_security.py::test_decode_access_token_invalido PASSED         [ 98%]
tests/test_security.py::test_decode_access_token_expirado PASSED         [100%]
```

### 6.2 Reporte de cobertura de código

```
Name                                Stmts   Miss  Cover   Missing
-----------------------------------------------------------------
app\__init__.py                         0      0   100%
app\api\__init__.py                     0      0   100%
app\api\deps.py                        43      1    98%   47
app\api\routers\__init__.py             0      0   100%
app\api\routers\auth.py                20      0   100%
app\api\routers\citas.py               43      1    98%   22
app\api\routers\dashboard.py            8      0   100%
app\api\routers\especialidades.py      33      1    97%   30
app\api\routers\medicos.py             33      1    97%   21
app\api\routers\pacientes.py           28      0   100%
app\core\__init__.py                    0      0   100%
app\core\config.py                     13      0   100%
app\core\database.py                   12      4    67%   20-24
app\core\security.py                   19      0   100%
app\domain\__init__.py                  0      0   100%
app\domain\exceptions.py                6      0   100%
app\main.py                            26      1    96%   55
app\models.py                          66      0   100%
app\repositories.py                   106      5    95%   163, 220, 319, 321, 325
app\schemas.py                         76      0   100%
app\services.py                       193     18    91%   93, 99, 101, 107, 138, 155, 159, 185, 190, 213, 215, 217, 219, 221, 225, 265, 274, 303
-----------------------------------------------------------------
TOTAL                                 725     32    96%

================== 67 passed, 1 xfailed, 1 warning in 24.11s ==================
```

**Resumen:** ✅ **67 de 68 pruebas pasaron**, **1 marcada como `xfail`
(fallo esperado y documentado**, no oculta ni ignorada — ver sección
6), y **96% de cobertura de código** — supera el mínimo del 80%
exigido en la planificación del proyecto (Fase 1).

[INSERTAR CAPTURA: `backend/htmlcov/index.html` abierto en el navegador, mostrando el detalle línea por línea de la cobertura]

---

## 7. Interpretación de resultados — cómo leer la salida

| Símbolo / texto | Qué significa |
|---|---|
| `PASSED` | La prueba pasó: el `assert` (o los `assert`) dentro de ella se cumplieron. |
| `FAILED` | La prueba **falló de verdad**: Pytest imprime el `assert` exacto que no se cumplió, con los valores obtenidos. |
| `XFAIL` | *Expected fail* — una prueba que **se espera que falle**, marcada explícitamente con `@pytest.mark.xfail(reason="...")` en el código, con la razón documentada. No cuenta como error; sirve para dejar constancia de una limitación conocida sin ocultarla ni borrarla. |
| `collected 68 items` | Pytest encontró 68 funciones de prueba en total. |
| `67 passed, 1 xfailed` | Resumen final: 67 exitosas + 1 fallo esperado = 68 en total, ninguna fallando de forma inesperada. |
| Tabla de cobertura (`Stmts`/`Miss`/`Cover`) | `Stmts` = líneas de código ejecutables en ese archivo; `Miss` = cuántas de esas líneas **nunca** se ejecutaron durante las pruebas; `Cover` = porcentaje cubierto. La columna `Missing` lista los números de línea exactos sin cubrir. |

### ¿Por qué hay exactamente una prueba `XFAIL` y no es un problema?

La prueba `test_cancelar_cita_libera_el_horario_para_nueva_reserva`
verifica que, tras cancelar una cita, se pueda agendar una cita nueva
en ese mismo horario. La regla **sí está correctamente implementada**
(`database/schema.sql` usa un índice único *parcial*:
`WHERE estado <> 'cancelada'`), pero **SQLite** —la base de datos
usada solo para que las pruebas corran rápido y sin instalar nada—
**no soporta índices parciales**, así que en esta suite el índice se
comporta como uno completo y bloquea la reutilización del horario.
Contra **PostgreSQL real** (Docker Compose), la regla funciona
correctamente — ver
[`03-docker-compose.md`](03-docker-compose.md) y el recorrido manual
de [`docs/GUIA_DE_PRUEBAS.md`](../GUIA_DE_PRUEBAS.md).

---

## 8. Relación con el resto del proyecto

Pytest prueba el backend **en aislamiento** (sin frontend, sin Docker,
con SQLite en memoria en vez de PostgreSQL). Esto permite obtener
retroalimentación en segundos sobre la lógica de negocio, pero por
diseño **no** valida:

- Que el contenedor `backend` arranque correctamente con Docker.
- Que las reglas que dependen de una característica exclusiva de
  PostgreSQL (el índice único parcial) funcionen en la base de datos
  real.
- La integración visual con el frontend.

Esas tres cosas se verifican en los otros dos documentos de esta
misma carpeta: [`01-testing-frontend-vitest.md`](01-testing-frontend-vitest.md)
para el frontend, y [`03-docker-compose.md`](03-docker-compose.md)
para el sistema completo integrado con Docker.

---

## 9. Conclusión

Pytest cumple en SaludYa el papel de **verificador automático de las
reglas de negocio del hospital**: horarios permitidos, no-domingos,
no-doble-reserva, permisos por rol, y la integridad de cada uno de los
26 endpoints. La evidencia de este documento (67/68 pruebas exitosas,
1 `xfail` documentado y explicado, 96% de cobertura) demuestra que,
al momento de esta entrega, el backend cumple con las reglas
definidas en la planificación del proyecto (Fase 1) y supera el
mínimo de cobertura exigido.

## 10. Referencias

- Documentación oficial de Pytest: <https://docs.pytest.org/>
- Documentación oficial de `coverage.py`: <https://coverage.readthedocs.io/>
- Documentación oficial de FastAPI sobre testing: <https://fastapi.tiangolo.com/tutorial/testing/>
- [`docs/fases/05-testing.md`](../fases/05-testing.md) — planificación y cierre formal de la fase de testing.
- [`docs/ARQUITECTURA.md`](../ARQUITECTURA.md) — organización del backend (Clean Architecture).
