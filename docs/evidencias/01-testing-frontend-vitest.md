# Documento de evidencias — Testing de Frontend con Vitest

## 0. Identificación del documento

| Campo | Detalle |
|---|---|
| **Proyecto** | SaludYa — Portal Web de Gestión Hospitalaria |
| **Tema documentado** | Pruebas automatizadas del **Frontend** (React) con **Vitest** + **React Testing Library** |
| **Repositorio** | [`saludya-hospital-portal`](https://github.com/davidcamilo2005/saludya-hospital-portal) |
| **Carpeta del proyecto donde se practica este tema** | [`frontend/`](../../frontend), específicamente [`frontend/src/**/*.test.js(x)`](../../frontend/src) y [`frontend/vite.config.js`](../../frontend/vite.config.js) |
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

Este documento se enfoca específicamente en el **frontend**; el
backend y la contenerización con Docker se documentan, con el mismo
nivel de detalle, en
[`02-testing-backend-pytest.md`](02-testing-backend-pytest.md) y
[`03-docker-compose.md`](03-docker-compose.md).

## 2. ¿Qué es Vitest y qué papel cumple en este proyecto?

**Vitest** es un **framework de pruebas automatizadas** para proyectos
JavaScript/TypeScript, creado por el mismo equipo detrás de **Vite**
(la herramienta que compila y sirve el frontend de este proyecto).
Su función es ejecutar código de prueba que **simula el uso real de
la aplicación** (llenar formularios, hacer clic en botones, navegar
entre páginas) y comparar el resultado obtenido contra el resultado
esperado, reportando automáticamente qué pasó y qué falló.

Se complementa con **React Testing Library (RTL)**, una librería que
permite escribir esas pruebas **desde la perspectiva de un usuario
real** (buscando elementos por su texto visible, su rol de
accesibilidad o su etiqueta) en lugar de depender de detalles internos
de implementación de cada componente. Esto hace que las pruebas sigan
siendo válidas aunque se refactorice el código interno de un
componente, mientras su comportamiento visible no cambie.

**Por qué se eligió Vitest y no otra herramienta** (por ejemplo Jest):
Vitest se integra de forma nativa con Vite —usa exactamente la misma
configuración de transformación de archivos (`vite.config.js`), por lo
que no hay que mantener dos configuraciones distintas ni esperar una
transpilación duplicada— y es notablemente más rápido en proyectos que
ya usan Vite como *bundler*.

**Rol dentro de SaludYa:** Vitest es la herramienta que le da al
proyecto **evidencia objetiva y repetible** de que el frontend
funciona como se espera: que los formularios validan correctamente,
que las rutas protegidas bloquean el acceso a quien no tiene sesión o
rol adecuado, que los componentes reutilizables (`Button`, `Badge`,
`Alert`...) se comportan bien, y que la capa que llama a la API
(`api/endpoints.js`) construye las peticiones exactamente como el
backend las espera.

---

## 3. Entorno de trabajo y cómo se instaló

### 3.1 Dónde se desarrolló

Todo el código del frontend (componentes, páginas, y las pruebas de
este documento) se escribió en **Visual Studio Code**, en un entorno
Windows. El repositorio se versionó con **Git** y se subió a
**GitHub** en `https://github.com/davidcamilo2005/saludya-hospital-portal`.

> **Nota importante sobre el entorno:** el código y las pruebas de este
> documento se ejecutaron **directamente en el sistema operativo**
> (sin Docker), instalando Node.js y las dependencias del proyecto de
> forma normal. Esto es intencional: Vitest, igual que Pytest en el
> backend, está diseñado para correr en la máquina de desarrollo, sin
> depender de contenedores. Docker (documentado por separado en
> [`03-docker-compose.md`](03-docker-compose.md)) es una capa distinta,
> pensada para el *despliegue* del sistema completo ya integrado, no
> para el ciclo de pruebas del día a día. Es, de hecho, uno de los
> motivos por los que este proyecto se subió a GitHub durante su
> desarrollo: para poder probarlo también en una máquina que sí tuviera
> Docker Desktop instalado, cosa que no estaba disponible en todos los
> entornos usados durante el desarrollo.

### 3.2 Qué se descargó y cómo se incluyó en el proyecto

Vitest **no se instala por separado**: se declara como una dependencia
de desarrollo dentro de [`frontend/package.json`](../../frontend/package.json)
junto con sus complementos, y se descarga automáticamente al ejecutar
`npm install`.

**Dependencias relacionadas con testing** (bloque `devDependencies` de `package.json`):

```json
"@testing-library/jest-dom": "^6.5.0",
"@testing-library/react": "^16.0.1",
"@testing-library/user-event": "^14.5.2",
"@vitest/coverage-v8": "^2.1.1",
"jsdom": "^25.0.1",
"vitest": "^2.1.1"
```

| Paquete | Para qué sirve |
|---|---|
| `vitest` | El motor que descubre, ejecuta y reporta las pruebas. |
| `jsdom` | Simula un navegador (DOM, `window`, `document`) dentro de Node.js, para poder "renderizar" componentes de React sin un navegador real. |
| `@testing-library/react` | Renderiza componentes React en el entorno de prueba y provee funciones para buscar elementos (`getByText`, `getByLabelText`, `getByRole`...). |
| `@testing-library/user-event` | Simula interacciones humanas reales (escribir, hacer clic) de forma más fiel que disparar eventos DOM manualmente. |
| `@testing-library/jest-dom` | Añade comprobaciones (`toBeInTheDocument`, `toHaveClass`, `toBeDisabled`...) más legibles que las de Vitest por defecto. |
| `@vitest/coverage-v8` | Genera el reporte de cobertura de código (qué porcentaje del código fue ejercitado por las pruebas). |

**Comando de instalación** (paso a paso):

```bash
cd frontend
npm install
```

[INSERTAR CAPTURA: terminal mostrando `npm install` completado, con el resumen "added 481 packages"]

Vitest queda configurado dentro de [`frontend/vite.config.js`](../../frontend/vite.config.js),
en el bloque `test`:

```js
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: "./src/test/setup.js",
  css: true,
  coverage: {
    provider: "v8",
    reporter: ["text", "html"],
    exclude: ["src/test/**", "**/*.test.jsx", "**/*.test.js"],
  },
},
```

`src/test/setup.js` simplemente importa `@testing-library/jest-dom`
para que sus comprobaciones estén disponibles en todas las pruebas sin
tener que importarlas archivo por archivo.

---

## 4. Dónde se está practicando este tema dentro del proyecto

Las pruebas viven **junto al archivo que prueban**, con el sufijo
`.test.js`/`.test.jsx` (convención de Vitest: las detecta
automáticamente sin configuración extra). Esto es intencional: mantiene
cada prueba visualmente cerca del código que valida.

| Archivo de prueba | Qué prueba | Tipo (exigido en Fase 1) |
|---|---|---|
| [`src/utils/validadores.test.js`](../../frontend/src/utils/validadores.test.js) | La función `validarRegistro` (reglas de contraseña, correo, campos obligatorios) | **Validaciones** |
| [`src/api/endpoints.test.js`](../../frontend/src/api/endpoints.test.js) | Que cada función de `api/endpoints.js` llame al método HTTP y la URL correctos, con el payload exacto | **API Mock** |
| [`src/components/ui.test.jsx`](../../frontend/src/components/ui.test.jsx) | El kit de componentes reutilizables: `Button`, `Badge`, `EstadoCitaBadge`, `Alert`, `FormField` | **Componentes** |
| [`src/routes/ProtectedRoute.test.jsx`](../../frontend/src/routes/ProtectedRoute.test.jsx) | Que las rutas protegidas redirijan correctamente según sesión/rol | **Rutas** |
| [`src/pages/auth/LoginPage.test.jsx`](../../frontend/src/pages/auth/LoginPage.test.jsx) | El formulario de login: envío, redirección según rol, manejo de error | **Formularios** |
| [`src/pages/auth/RegistroPage.test.jsx`](../../frontend/src/pages/auth/RegistroPage.test.jsx) | El formulario de registro: validación antes de llamar a la API, éxito, error del servidor | **Formularios** |

Estos seis archivos cubren, en conjunto, los cinco tipos de prueba que
la planificación del proyecto (Fase 1) exige para el frontend:
formularios, componentes, rutas, API Mock y validaciones.

---

## 5. Cómo se ejecutan las pruebas (paso a paso)

```bash
cd frontend
npm install          # solo la primera vez, o si package.json cambió
npm test             # ejecuta toda la suite una vez y termina
```

Otras variantes útiles:

```bash
npm run test:watch      # se re-ejecuta automáticamente cada vez que guardas un archivo
npm run test:coverage   # igual que "npm test" pero además genera el reporte de cobertura
npm run lint             # analiza el código en busca de errores/inconsistencias (no es Vitest, pero se corre en el mismo flujo de calidad)
npm run build            # compila la app para producción; confirma que no hay errores de compilación
```

---

## 6. Evidencia real de la ejecución (salida obtenida)

> Las salidas que siguen son la **transcripción textual real** de
> haber ejecutado estos comandos contra el código actual del
> repositorio (instalación de `node_modules` desde cero, 481 paquetes,
> Node.js 24), no una simulación ni un resultado "esperado" escrito a
> mano.

[INSERTAR CAPTURA: terminal de VS Code ejecutando `npm test`, con el resultado en verde]

### 6.1 Resultado de `npx vitest run --reporter=verbose`

```
✓ src/utils/validadores.test.js > validarRegistro > no devuelve errores para un formulario válido
✓ src/utils/validadores.test.js > validarRegistro > exige el nombre
✓ src/utils/validadores.test.js > validarRegistro > exige el apellido
✓ src/utils/validadores.test.js > validarRegistro > rechaza un correo con formato inválido
✓ src/utils/validadores.test.js > validarRegistro > exige el documento de identidad
✓ src/utils/validadores.test.js > validarRegistro > rechaza una contraseña de menos de 8 caracteres
✓ src/utils/validadores.test.js > validarRegistro > rechaza una contraseña sin número
✓ src/utils/validadores.test.js > validarRegistro > rechaza una contraseña sin letra
✓ src/utils/validadores.test.js > validarRegistro > rechaza contraseñas que no coinciden
✓ src/utils/validadores.test.js > validarRegistro > acumula varios errores a la vez

✓ src/api/endpoints.test.js > authApi > registrar hace POST a /auth/register con el payload exacto
✓ src/api/endpoints.test.js > authApi > login hace POST a /auth/login
✓ src/api/endpoints.test.js > authApi > perfilActual hace GET a /auth/me
✓ src/api/endpoints.test.js > especialidadesApi > listarPublicas hace GET a /especialidades
✓ src/api/endpoints.test.js > especialidadesApi > desactivar hace DELETE a /especialidades/:id
✓ src/api/endpoints.test.js > medicosApi > crear hace POST a /medicos con el payload
✓ src/api/endpoints.test.js > citasApi > agendar hace POST a /citas
✓ src/api/endpoints.test.js > citasApi > cancelar hace PATCH a /citas/:id/cancelar con el motivo
✓ src/api/endpoints.test.js > pacientesApi > actualizarMiPerfil hace PUT a /pacientes/me

✓ src/routes/ProtectedRoute.test.jsx > ProtectedRoute > muestra un loader mientras se verifica la sesión
✓ src/routes/ProtectedRoute.test.jsx > ProtectedRoute > redirige a /login si no hay sesión activa
✓ src/routes/ProtectedRoute.test.jsx > ProtectedRoute > redirige a / si el rol del usuario no coincide con el requerido
✓ src/routes/ProtectedRoute.test.jsx > ProtectedRoute > renderiza el contenido protegido si el usuario tiene el rol correcto
✓ src/routes/ProtectedRoute.test.jsx > ProtectedRoute > permite el acceso sin restricción de rol cuando rolRequerido no se especifica

✓ src/components/ui.test.jsx > Button > renderiza su contenido y responde a clics
✓ src/components/ui.test.jsx > Button > se deshabilita cuando recibe disabled
✓ src/components/ui.test.jsx > Button > aplica la clase del variant solicitado
✓ src/components/ui.test.jsx > Badge > renderiza el texto recibido
✓ src/components/ui.test.jsx > EstadoCitaBadge > muestra la etiqueta correcta para una cita pendiente
✓ src/components/ui.test.jsx > EstadoCitaBadge > muestra la etiqueta correcta para una cita completada
✓ src/components/ui.test.jsx > EstadoCitaBadge > cae al valor crudo si el estado no está mapeado
✓ src/components/ui.test.jsx > Alert > renderiza el mensaje recibido
✓ src/components/ui.test.jsx > FormField > asocia el label al input mediante htmlFor/id
✓ src/components/ui.test.jsx > FormField > muestra el mensaje de error cuando se provee

✓ src/pages/auth/RegistroPage.test.jsx > RegistroPage > no llama a la API si el formulario tiene errores de validación
✓ src/pages/auth/LoginPage.test.jsx > LoginPage > envía las credenciales y navega a /paciente/citas si el rol es paciente (627ms)
✓ src/pages/auth/LoginPage.test.jsx > LoginPage > navega a /admin si el rol autenticado es administrador (508ms)
✓ src/pages/auth/RegistroPage.test.jsx > RegistroPage > muestra un error si las contraseñas no coinciden (1329ms)
✓ src/pages/auth/LoginPage.test.jsx > LoginPage > muestra el mensaje de error de la API cuando el login falla (708ms)
✓ src/pages/auth/RegistroPage.test.jsx > RegistroPage > registra al paciente y navega a /login cuando el formulario es válido (1076ms)
✓ src/pages/auth/RegistroPage.test.jsx > RegistroPage > muestra el error de la API si el registro falla (p. ej. correo duplicado) (1086ms)

 Test Files  6 passed (6)
      Tests  41 passed (41)
   Start at  18:38:43
   Duration  6.73s
```

**Resumen:** ✅ **41 de 41 pruebas pasaron**, en los 6 archivos de
prueba, sin ninguna omitida ni fallida.

### 6.2 Resultado de `npm run build` (compilación de producción)

```
vite v5.4.21 building for production...
✓ 116 modules transformed.
dist/index.html                 0.76 kB │ gzip:  0.48 kB
dist/assets/index-DIMOZsDc.css  25.53 kB │ gzip:  5.24 kB
dist/assets/index-DTkxsftc.js   279.85 kB │ gzip: 87.12 kB
✓ built in 1.86s
```

Confirma que, además de pasar las pruebas de comportamiento, el
código **compila sin errores** para producción (sin imports rotos,
sin JSX inválido).

### 6.3 Resultado de `npm run lint` (calidad de código)

```
C:\general_proyectos\proyecto_ospital\frontend\src\context\AuthContext.jsx
  61:17  warning  Fast refresh only works when a file only exports components.
  Use a new file to share constants or functions between components  react-refresh/only-export-components

✖ 1 problem (0 errors, 1 warning)
```

**0 errores.** La única advertencia es esperada y no bloqueante: ocurre
porque `AuthContext.jsx` exporta, además del componente `AuthProvider`,
el hook `useAuth` (patrón estándar y recomendado en proyectos React;
la alternativa —separar el hook en otro archivo— no aporta valor real
aquí).

[INSERTAR CAPTURA: reporte HTML de cobertura (`frontend/coverage/index.html`) abierto en el navegador, generado con `npm run test:coverage`]

---

## 7. Interpretación de resultados — cómo leer la salida

| Símbolo / texto | Qué significa |
|---|---|
| `✓` (check verde) | La prueba pasó: el resultado obtenido coincidió con el esperado. |
| `✗` (equis roja) | La prueba **falló**. Vitest imprime justo debajo el valor esperado (`Expected`) contra el recibido (`Received`), y la línea exacta del archivo de prueba. |
| `Test Files  6 passed (6)` | De 6 archivos de prueba, los 6 pasaron completos. |
| `Tests  41 passed (41)` | De 41 pruebas individuales, las 41 pasaron. |
| Un tiempo entre paréntesis, ej. `(1329ms)` | Cuánto tardó esa prueba puntual; Vitest lo resalta cuando una prueba es más lenta de lo normal (aquí, por simular escritura de formularios completos con `user-event`, no por un problema). |
| `React Router Future Flag Warning` (en `stderr`) | Aviso informativo de una librería sobre un cambio futuro (v7 de React Router); no es un error ni afecta el resultado de la prueba. |

---

## 8. Relación con el resto del proyecto

Estas pruebas validan la capa de frontend **de forma aislada**, usando
mocks para la API (`vi.mock("./client")` en `endpoints.test.js`, o
mockeando `useAuth`/`registrar`/`login` en los formularios) — es decir,
**no requieren que el backend ni la base de datos estén corriendo**.
Esto es intencional: permite ejecutar esta suite en segundos, en
cualquier máquina, sin necesidad de Docker ni de una base de datos
real, y detectar errores de la interfaz antes de siquiera integrarla
con el backend.

La integración real frontend↔backend↔base de datos (los tres
funcionando juntos) se verifica en un nivel distinto: manualmente,
siguiendo el recorrido de
[`docs/GUIA_DE_PRUEBAS.md`](../GUIA_DE_PRUEBAS.md#8-prueba-manual-completa-de-principio-a-fin),
o levantando todo con Docker Compose (ver
[`03-docker-compose.md`](03-docker-compose.md)).

---

## 9. Conclusión

Vitest, junto con React Testing Library, cumple en este proyecto el
papel de **red de seguridad automatizada** del frontend: cada vez que
se modifica un componente, una página o una función de validación, se
puede correr `npm test` y saber en segundos si algo que funcionaba
dejó de funcionar. La evidencia capturada en este documento (41/41
pruebas exitosas, build limpio, 0 errores de lint) demuestra que, al
momento de esta entrega, el frontend cumple con los cinco tipos de
prueba exigidos y no tiene regresiones conocidas.

## 10. Referencias

- Documentación oficial de Vitest: <https://vitest.dev/>
- Documentación oficial de React Testing Library: <https://testing-library.com/docs/react-testing-library/intro/>
- [`docs/fases/05-testing.md`](../fases/05-testing.md) — planificación y cierre formal de la fase de testing.
- [`docs/ARQUITECTURA.md`](../ARQUITECTURA.md) — organización del frontend.
