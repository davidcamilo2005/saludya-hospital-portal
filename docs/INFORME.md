# Informe universitario — SaludYa

## Portada

**Proyecto:** SaludYa — Portal Web de Gestión Hospitalaria
**Tipo de trabajo:** Proyecto de desarrollo de software (académico)
**Autor:** David Camilo Otero Maturana
**Fecha:** Agosto de 2026
**Repositorio:** [`saludya-hospital-portal`](https://github.com)

---

## 1. Introducción

Este informe documenta el diseño, desarrollo, pruebas y despliegue de
SaludYa, un portal web que digitaliza los trámites administrativos que
un paciente normalmente realiza de forma presencial en un hospital:
solicitar, consultar y cancelar una cita médica. El proyecto se
desarrolló siguiendo un proceso por fases —análisis, diseño de base de
datos, backend, frontend, pruebas, contenerización y documentación—,
cada una revisada y cerrada antes de iniciar la siguiente, replicando
la forma de trabajar de un equipo de desarrollo profesional.

El documento explica no solo *qué* se construyó, sino *por qué* se
tomó cada decisión relevante, y no asume conocimiento previo del
lector sobre las tecnologías empleadas: cada una se introduce
explicando qué es, para qué sirve y por qué se eligió sobre las
alternativas disponibles.

## 2. Problema

Actualmente, muchas personas acuden físicamente a un hospital
únicamente para realizar procesos administrativos sencillos: solicitar
una cita, consultarla, cancelarla, conocer horarios o especialidades
disponibles. Esto provoca congestión en las instalaciones, filas
largas, pérdida de tiempo para el paciente, retrasos en la atención y
sobrecarga del personal administrativo — recursos que podrían
concentrarse en pacientes que sí requieren atención presencial.

## 3. Justificación

Un portal web de autoservicio resuelve este problema trasladando los
trámites administrativos a un canal digital disponible en cualquier
momento, sin depender del horario de atención en ventanilla. Reduce la
carga operativa del hospital, disminuye tiempos de espera y mejora la
experiencia del paciente, que puede gestionar sus citas desde
cualquier dispositivo con acceso a internet. Desde la perspectiva
académica, el proyecto permite aplicar de forma integrada
conocimientos de ingeniería de software (arquitectura, patrones de
diseño), bases de datos (modelado relacional, normalización),
desarrollo web full-stack, pruebas automatizadas y DevOps
(contenerización), documentando cada decisión de forma trazable.

## 4. Objetivos

### 4.1 Objetivo general

Diseñar y desarrollar un portal web hospitalario moderno que permita
gestionar consultas administrativas de manera virtual, optimizando la
atención al paciente y reduciendo la congestión del hospital mediante
tecnologías web modernas.

### 4.2 Objetivos específicos

- Permitir el registro e inicio de sesión seguro de pacientes, con
  autenticación basada en JWT.
- Permitir agendar, consultar y cancelar citas médicas, aplicando las
  reglas de negocio del hospital (horario de atención, días
  disponibles, no doble reserva).
- Exponer información institucional pública: especialidades, médicos,
  contacto y preguntas frecuentes.
- Proveer un panel administrativo con dashboard, gestión de médicos,
  especialidades, citas y pacientes.
- Diseñar una base de datos relacional normalizada que respalde estas
  operaciones con integridad referencial y reglas a nivel de motor de
  base de datos.
- Construir el sistema con pruebas automatizadas verificables y
  contenerizarlo para un despliegue reproducible con un solo comando.

## 5. Marco teórico

### 5.1 Arquitectura Cliente-Servidor y API REST

El sistema separa un **cliente** (la aplicación que corre en el
navegador) de un **servidor** (la API que gestiona los datos y las
reglas de negocio), comunicados por HTTP siguiendo el estilo **REST**
(Representational State Transfer): cada recurso del dominio
(pacientes, médicos, citas...) se expone como una URL, y las
operaciones sobre él se expresan con verbos HTTP (`GET`, `POST`,
`PUT`, `PATCH`, `DELETE`). Se eligió sobre alternativas como GraphQL
por su simplicidad, su curva de aprendizaje más baja para un proyecto
de este tamaño, y por ser el estándar mejor soportado por el
ecosistema FastAPI/OpenAPI (documentación interactiva autogenerada).

### 5.2 Clean Architecture

Propuesta popularizada por Robert C. Martin, organiza el código en
capas concéntricas donde las dependencias solo pueden apuntar "hacia
adentro": la lógica de negocio (dominio) no depende de detalles de
infraestructura (framework web, motor de base de datos), sino al
revés. Se eligió porque hace que las reglas de negocio (horarios,
no-doble-reserva, permisos) sean el centro del sistema, verificables
sin necesidad de un servidor HTTP ni una base de datos real corriendo
—como demuestra la suite de pruebas del backend, que corre contra una
base en memoria—, y porque facilita reemplazar piezas de
infraestructura (por ejemplo, cambiar de PostgreSQL a otro motor) sin
tocar la lógica de negocio.

### 5.3 JSON Web Tokens (JWT)

Un JWT es un token firmado digitalmente que codifica información
(claims) sobre un usuario autenticado —en este proyecto, su id y su
rol— de forma que el servidor puede verificar su autenticidad sin
necesidad de guardar sesiones en memoria o base de datos (autenticación
*stateless*). Se eligió sobre sesiones tradicionales porque escala
mejor horizontalmente (cualquier instancia del backend puede validar
el token sin compartir estado) y es el estándar de facto para APIs
REST modernas.

### 5.4 ORM (Object-Relational Mapping)

Un ORM traduce entre objetos de un lenguaje de programación (clases
Python) y filas de una base de datos relacional, evitando escribir SQL
manual para las operaciones comunes y reduciendo el riesgo de
inyección SQL. Este proyecto usa **SQLAlchemy**, el ORM más maduro y
usado del ecosistema Python, con soporte de primera clase en FastAPI.

### 5.5 Normalización de bases de datos

Conjunto de reglas (1FN, 2FN, 3FN) para diseñar tablas relacionales que
minimicen la redundancia de datos y eviten anomalías de actualización.
Se aplicaron las tres formas normales al modelo de SaludYa; el
razonamiento completo, con ejemplos concretos de qué se evitó en cada
forma, está en [`docs/ARQUITECTURA.md`](ARQUITECTURA.md#normalización).

### 5.6 Contenerización con Docker

Docker empaqueta una aplicación junto con todas sus dependencias
(intérprete, librerías, configuración del sistema operativo) en una
imagen que corre de forma idéntica en cualquier máquina con Docker
instalado, eliminando el clásico problema de "en mi máquina funciona".
Docker Compose orquesta múltiples contenedores (en este proyecto:
base de datos, backend y frontend) como un solo sistema, declarado en
un archivo de texto versionable (`docker-compose.yml`). Se eligió
porque reduce la puesta en marcha del proyecto completo a un solo
comando (`docker compose up --build`), independiente del sistema
operativo del evaluador.

### 5.7 Tecnologías del stack — qué son, para qué sirven y por qué se eligieron

| Tecnología | Qué es | Para qué sirve en este proyecto | Por qué se eligió |
|---|---|---|---|
| **React 18** | Librería de JavaScript para construir interfaces de usuario basadas en componentes | Construye toda la SPA (Single Page Application) del frontend | Ecosistema maduro, curva de aprendizaje razonable, patrón de componentes reutilizables alineado con el requisito de "componentes reutilizables, no estilos improvisados" |
| **Vite** | Herramienta de build para proyectos frontend | Compila y sirve el proyecto React en desarrollo y producción | Arranque y recarga en caliente casi instantáneos frente a alternativas como Create React App (descontinuado); integra Vitest de forma nativa |
| **TailwindCSS** | Framework de utilidades CSS | Da estilo a toda la interfaz sin escribir CSS a mano por componente | Permite un sistema de diseño consistente (paleta azul/blanco/gris, verde solo éxito) centralizado en `components/ui.jsx`, cumpliendo el requisito de "no usar estilos improvisados" |
| **Axios** | Cliente HTTP para JavaScript | Todas las llamadas del frontend a la API pasan por una instancia configurada de Axios (`api/client.js`) | Interceptores de request/response que centralizan el envío del JWT y el manejo de errores, algo más verboso de lograr con `fetch` nativo |
| **React Router** | Librería de enrutamiento para React | Define las rutas públicas, de paciente y de administrador, y protege las privadas por rol | Estándar de facto para SPAs en React; soporta rutas anidadas, que se usan para los layouts (`PublicLayout`, `DashboardLayout`) |
| **Vitest + React Testing Library** | Framework de pruebas (Vitest) + utilidades para probar componentes desde la perspectiva del usuario (RTL) | Prueban formularios, componentes, rutas protegidas, mocks de API y validaciones | Vitest se integra nativamente con Vite (misma configuración, sin transpilación duplicada); RTL fuerza a probar el comportamiento visible al usuario, no detalles de implementación |
| **Python 3.11** | Lenguaje de programación de propósito general | Lenguaje del backend completo | Tipado gradual maduro (`type hints`), rendimiento mejorado sobre versiones previas, y es el lenguaje con mejor soporte para FastAPI |
| **FastAPI** | Framework web para construir APIs en Python | Framework de todo el backend | Validación automática de datos (vía Pydantic), documentación interactiva autogenerada (Swagger/OpenAPI), y rendimiento asíncrono nativo |
| **SQLAlchemy** | ORM y toolkit de acceso a bases de datos para Python | Mapea las tablas (`usuarios`, `citas`, ...) a clases Python y ejecuta las consultas | ORM más completo del ecosistema Python, con soporte maduro para índices parciales de PostgreSQL (clave para la regla de no-doble-reserva) |
| **Pydantic** | Librería de validación de datos basada en type hints de Python | Define los esquemas de entrada/salida de la API (`schemas.py`) | Integración nativa con FastAPI; valida y documenta automáticamente el contrato de la API |
| **python-jose** | Implementación de JOSE (JSON Object Signing and Encryption) en Python | Genera y valida los JWT de autenticación | Librería madura y ampliamente usada para JWT en proyectos FastAPI |
| **passlib + bcrypt** | Librería de hashing de contraseñas | Convierte cada contraseña en un hash irreversible antes de guardarla | bcrypt es un algoritmo de hashing diseñado específicamente para contraseñas (lento a propósito, resistente a fuerza bruta), a diferencia de hashes de propósito general como SHA-256 |
| **Alembic** | Herramienta de migraciones de esquema para SQLAlchemy | Versiona los cambios futuros al esquema de base de datos | Permite evolucionar el esquema de forma controlada y reproducible en cualquier entorno, sin editar la base de datos a mano |
| **Pytest** | Framework de pruebas para Python | Ejecuta toda la suite de pruebas del backend | Estándar de facto en el ecosistema Python; sintaxis de fixtures que simplifica el aislamiento de cada prueba (base de datos en memoria por test) |
| **PostgreSQL 15** | Sistema de gestión de bases de datos relacional | Almacena todos los datos persistentes del sistema | Soporte robusto de integridad referencial, `CHECK` constraints e **índices únicos parciales** — esta última característica es la que resuelve correctamente la regla de no-doble-reserva sin bloquear la reutilización de horarios cancelados (ver sección de Base de Datos) |
| **Docker / Docker Compose** | Plataforma de contenerización | Empaqueta y orquesta los tres servicios del sistema | Despliegue reproducible con un solo comando, independiente del sistema operativo anfitrión |
| **Nginx** | Servidor web / proxy inverso | Sirve el build estático de React y reenvía las llamadas a `/api/*` hacia el backend | Ligero, estándar de la industria para servir SPAs y hacer de reverse proxy en producción |

## 6. Metodología

El desarrollo se organizó en **8 fases secuenciales**, cada una cerrada
y aprobada antes de iniciar la siguiente (documentadas íntegramente en
[`docs/fases/`](fases/)):

1. Análisis y planificación (historias de usuario, casos de uso, backlog).
2. Diseño de base de datos (normalización, DER, modelo lógico y físico).
3. Backend completo.
4. Frontend completo.
5. Pruebas automatizadas (Pytest + Vitest).
6. Contenerización (Docker + Docker Compose).
7. Documentación.
8. Informe universitario (este documento).

Este enfoque —similar a un Scrum con "sprints" temáticos en vez de
por tiempo fijo— permitió validar cada capa del sistema antes de
construir la siguiente encima, minimizando retrabajo.

## 7. Arquitectura

Ver [`docs/ARQUITECTURA.md`](ARQUITECTURA.md) para el documento
completo: diagrama de despliegue, Clean Architecture del backend,
organización del frontend, DER, normalización y la doble barrera de
reglas de negocio (aplicación + base de datos).

[INSERTAR IMAGEN: Arquitectura]
[INSERTAR IMAGEN: DER]

## 8. Diseño (UX/UI)

El sistema usa una paleta de colores asociada al sector salud: azul
como color primario y de marca (confianza, profesionalismo), blancos y
grises suaves como base (limpieza, minimalismo), y verde reservado
**únicamente** para acciones y estados exitosos (siguiendo la
convención de que el verde comunica "todo salió bien" y no debe
usarse decorativamente). El rojo se reserva para acciones destructivas
y errores. Todo el sistema de diseño está centralizado en
`frontend/src/components/ui.jsx`, de modo que ninguna página define
colores "sueltos".

La interfaz es responsive (breakpoints `sm`/`md` de Tailwind: menú de
navegación colapsable, tablas con scroll horizontal en móvil, grids
adaptables) y cuida accesibilidad básica: cada campo de formulario
tiene un `<label>` asociado, los controles interactivos usan
`aria-label`/`aria-expanded`, y el foco de teclado es visible
(`:focus-visible` definido globalmente).

[INSERTAR IMAGEN: Landing]
[INSERTAR IMAGEN: Dashboard]

## 9. Desarrollo

### 9.1 Backend

26 endpoints de negocio organizados en 6 routers (`auth`, `pacientes`,
`medicos`, `especialidades`, `citas`, `dashboard`), siguiendo
estrictamente la regla de dependencia de Clean Architecture descrita
en la sección de arquitectura. Cada regla de negocio (horario de
atención, prohibición de domingos, no doble reserva, un médico solo
puede atender su propia especialidad, no cancelar citas ajenas) vive
en `app/services.py`, con pruebas unitarias e de integración
dedicadas.

### 9.2 Frontend

15 páginas organizadas en cuatro módulos (público, autenticación,
paciente, administrador), todas consumiendo la API exclusivamente a
través de `api/endpoints.js`, con manejo centralizado de sesión
(`AuthContext`) y de errores (interceptor de Axios).

### 9.3 Base de datos

6 tablas normalizadas hasta 3FN, con `CHECK` constraints para las
reglas de horario/día y un índice único parcial para la regla de no
doble reserva —detalle explicado en profundidad en
`docs/ARQUITECTURA.md`, incluyendo la corrección de un error real
detectado durante la revisión final del proyecto (ver sección de
Resultados).

## 10. Implementación

El sistema completo se levanta con:

```bash
docker compose up --build
```

que construye las imágenes de backend y frontend, levanta PostgreSQL,
ejecuta `database/schema.sql` y `database/seed.sql` en el primer
arranque, y expone el frontend en `http://localhost:8080` y la API en
`http://localhost:8000`. Ver [`docs/MANUAL_DESARROLLADOR.md`](MANUAL_DESARROLLADOR.md)
para el detalle completo, incluyendo la puesta en marcha manual sin
Docker.

## 11. Pruebas

### 11.1 Backend — Pytest

68 pruebas (67 passed + 1 xfail documentado), **96% de cobertura**,
ejecutadas contra una base de datos SQLite en memoria (aislada por
prueba) que sustituye a PostgreSQL solo para poder correr la suite sin
depender de un servidor de base de datos externo. Cubren: los 26
endpoints de negocio, autenticación JWT (creación/decodificación/token
inválido/expirado), CRUD completo de médicos/especialidades/pacientes,
y las reglas de negocio de citas con sus códigos HTTP exactos.

[INSERTAR IMAGEN: Pytest]

### 11.2 Frontend — Vitest + React Testing Library

41 pruebas cubriendo los cinco tipos exigidos en la Fase 1: formularios
(login, registro), componentes (`Button`, `Badge`, `EstadoCitaBadge`,
`Alert`, `FormField`), rutas protegidas (redirección por sesión y por
rol), mocks de API (verificación exacta de método/URL/payload) y
validaciones (`validarRegistro`, extraída a un módulo independiente
para poder probarla de forma aislada).

[INSERTAR IMAGEN: Vitest]

### 11.3 Verificación real, no solo declarada

Ambas suites, además del build de producción (`vite build`) y el lint
(`eslint`), se instalaron y ejecutaron realmente contra el código
final de este repositorio durante la fase de revisión —no se asumió
que el código escrito "debería" pasar las pruebas—. El único resultado
no verificable en este entorno de desarrollo fue la orquestación de
Docker Compose en sí (no hay Docker instalado en esta máquina), lo
cual queda documentado explícitamente como limitación en
`docs/fases/06-docker.md`, junto con los pasos exactos para validarlo
en un entorno que sí tenga Docker disponible.

## 12. Resultados

- Sistema completo y funcional: 26 endpoints de backend, 15 páginas de
  frontend, base de datos normalizada con 6 tablas.
- 109 pruebas automatizadas en total (68 backend + 41 frontend),
  ejecutadas realmente con resultados verificables y reproducibles.
- **96% de cobertura de código en el backend**, por encima del 80%
  mínimo exigido.
- **Corrección de un defecto real de integridad de datos**: durante la
  revisión final se encontró que `database/schema.sql` implementaba la
  regla "no dos citas activas para el mismo médico/horario" con un
  `UNIQUE` de tabla completo, que en la práctica **impedía reagendar un
  horario después de cancelarlo** — contradiciendo la propia regla de
  negocio "cancelar libera el horario" (HU-10), que sí estaba
  correctamente implementada en el modelo SQLAlchemy. Se corrigió
  reemplazándolo por el índice único parcial que el modelo lógico ya
  especificaba, alineando el modelo físico con el diseño documentado.
  Este hallazgo es evidencia de por qué la doble barrera
  aplicación+base de datos (sección de Arquitectura) importa: una
  prueba automatizada aislada en SQLite no lo detecta (SQLite no
  soporta índices parciales), pero la revisión manual del script SQL sí.
- Reorganización completa del código fuente a una estructura de
  industria (`backend/app/`, `frontend/src/`) y adición de toda la
  infraestructura que la documentación de fases previas asumía pero
  que no existía en el repositorio (`requirements.txt`, `package.json`,
  configuración de Vite/Tailwind/ESLint, la suite de pruebas completa,
  Docker, y esta misma documentación).

## 13. Conclusiones

El desarrollo de SaludYa demuestra que aplicar Clean Architecture desde
el inicio de un proyecto de este tamaño no es sobre-ingeniería
innecesaria: permitió aislar las reglas de negocio del framework web y
del motor de base de datos, lo que a su vez hizo posible probarlas de
forma rápida y aislada (suite de Pytest completa en menos de 30
segundos, sin depender de PostgreSQL). El proceso por fases, con cada
una cerrada y verificada antes de avanzar, redujo el riesgo de
construir sobre una base incorrecta — y a la vez, la revisión final
integral del proyecto fue la que detectó una inconsistencia real entre
el modelo físico de base de datos y el resto del sistema, reforzando
la importancia de una etapa de revisión dedicada incluso cuando cada
fase individual ya fue "aprobada". El resultado es un sistema que
cumple los objetivos planteados y que cualquier desarrollador puede
clonar, entender, ejecutar y extender siguiendo la documentación de
`docs/`.

## 14. Bibliografía

- Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to
  Software Structure and Design*. Prentice Hall.
- Fielding, R. T. (2000). *Architectural Styles and the Design of
  Network-based Software Architectures* (tesis doctoral — origen del
  estilo arquitectónico REST). University of California, Irvine.
- FastAPI — Documentación oficial. https://fastapi.tiangolo.com/
- SQLAlchemy — Documentación oficial. https://docs.sqlalchemy.org/
- React — Documentación oficial. https://react.dev/
- Vite — Documentación oficial. https://vitejs.dev/
- PostgreSQL 15 — Documentación oficial, capítulo de índices.
  https://www.postgresql.org/docs/15/indexes-partial.html
- Docker — Documentación oficial. https://docs.docker.com/
- IETF RFC 7519 — JSON Web Token (JWT). https://www.rfc-editor.org/rfc/rfc7519
- Codd, E. F. (1970). *A Relational Model of Data for Large Shared
  Data Banks*. Communications of the ACM (origen de la normalización
  de bases de datos relacionales).
