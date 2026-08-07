# SaludYa – Portal Web de Gestión Hospitalaria

## Fase 4 — Frontend completo

Estado: **Aprobada**.

---

## 1. Organización de carpetas

```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs / .eslintignore
├── .env.example
├── package.json
└── src/
    ├── main.jsx              # Bootstrap: BrowserRouter + AuthProvider + App
    ├── App.jsx                # Definición de rutas
    ├── index.css              # Tailwind + estilos base
    ├── api/
    │   ├── client.js           # Instancia Axios + interceptores JWT
    │   └── endpoints.js        # Funciones por recurso (authApi, citasApi, ...)
    ├── context/
    │   └── AuthContext.jsx     # Estado de sesión (usuario, login, logout, registro)
    ├── routes/
    │   └── ProtectedRoute.jsx  # Guard de rutas por autenticación/rol
    ├── components/
    │   ├── ui.jsx               # Kit de componentes reutilizables
    │   └── layout/
    │       ├── Navbar.jsx, Footer.jsx, PublicLayout.jsx, DashboardLayout.jsx
    ├── constants/
    │   └── institucional.js    # Historia, misión, visión, contacto, FAQ (HU-01, HU-04)
    ├── utils/
    │   └── validadores.js      # Validaciones de formularios (testeadas por separado)
    └── pages/
        ├── public/              # Landing, Especialidades, Médicos, Contacto, FAQ
        ├── auth/                # Login, Registro
        ├── paciente/            # Perfil, Agendar cita, Mis citas
        └── admin/                # Dashboard, Médicos, Especialidades, Citas, Pacientes
```

## 2. Consumo de la API (Fase 3)

- `api/client.js`: instancia única de Axios. Un interceptor de *request* adjunta el JWT desde `localStorage` en cada llamada; un interceptor de *response* normaliza los errores del backend (usa el campo `detail` que devuelve FastAPI) y limpia la sesión ante un 401.
- `api/endpoints.js`: una función por endpoint de la Fase 3, agrupada por recurso (`authApi`, `especialidadesApi`, `medicosApi`, `pacientesApi`, `citasApi`, `dashboardApi`). Las páginas nunca llaman a Axios directamente, siempre pasan por estas funciones — mismo principio de capas aplicado en el backend.
- `context/AuthContext.jsx`: única fuente de verdad del usuario autenticado. Al cargar la app, si hay un token guardado, se valida contra `GET /auth/me`; si el token es inválido se limpia la sesión sin romper la navegación pública.

## 3. Enrutamiento y control de acceso

| Grupo | Layout | Guardia | Rutas |
|---|---|---|---|
| Público | `PublicLayout` | ninguna | `/`, `/especialidades`, `/medicos`, `/contacto`, `/faq`, `/login`, `/registro` |
| Paciente | `DashboardLayout` | `ProtectedRoute rolRequerido="paciente"` | `/paciente/perfil`, `/paciente/agendar`, `/paciente/citas` |
| Administrador | `DashboardLayout` | `ProtectedRoute rolRequerido="administrador"` | `/admin`, `/admin/citas`, `/admin/medicos`, `/admin/especialidades`, `/admin/pacientes` |

`ProtectedRoute` redirige a `/login` si no hay sesión, y a `/` si el rol del usuario no coincide con el requerido por el grupo de rutas (p. ej. un paciente no puede entrar a `/admin`). Esto refleja en el cliente los mismos límites que ya aplica el backend (`require_paciente` / `require_admin`), como defensa en profundidad de UX, no de seguridad (la seguridad real vive en el backend).

## 4. Sistema de diseño

Paleta según Fase 1 ("Diseño"): azul (`blue-*`) como color primario y de marca, blancos y grises suaves (`slate-*`) como base, y verde (`emerald-*`) reservado **únicamente** para estados y acciones exitosas (alertas de éxito, badge "Completada"). El rojo (`red-*`) se usa para acciones destructivas/errores — una adición razonable no cubierta explícitamente por el alcance, mantenida al mínimo (solo cancelar/errores).

El kit `components/ui.jsx` centraliza estos criterios (`Button`, `Badge`, `Alert`, etc.) para que ningún componente de página defina colores "sueltos" (cumple la instrucción "no utilizar estilos improvisados"). Todos los componentes son responsive (grid/flex con breakpoints `sm`/`md`) y cuidan accesibilidad básica: `label` asociado a cada input, `aria-label`/`aria-expanded` en controles interactivos, y contraste de foco visible (`:focus-visible` en `index.css`).

## 5. Cobertura funcional (mapeo a historias de usuario)

| Página | Historias de usuario cubiertas |
|---|---|
| `LandingPage` | HU-01 |
| `EspecialidadesPage` | HU-02 |
| `MedicosPage` | HU-03 |
| `ContactoPage`, `FaqPage` | HU-04 |
| `RegistroPage` | HU-05 |
| `LoginPage` | HU-06 |
| `PerfilPage` | HU-07 |
| `AgendarCitaPage` | HU-08 |
| `MisCitasPage` (sección pendientes) | HU-09, HU-10 |
| `Navbar` (cerrar sesión) | HU-11 |
| `admin/DashboardPage` | HU-12 |
| `admin/MedicosAdminPage` | HU-13 |
| `admin/EspecialidadesAdminPage` | HU-14 |
| `admin/CitasAdminPage` | HU-15 |
| `admin/PacientesAdminPage` | HU-16 |

**Decisión de alcance:** el contenido institucional (historia, misión, visión, contacto, FAQ) se implementó como datos estáticos en `constants/institucional.js`, no como contenido editable desde el panel admin, porque ninguna historia de usuario de la Fase 1 pide esa edición. Queda documentado como posible extensión futura (tabla `contenido_institucional` + endpoints CRUD) si el alcance del proyecto creciera.

## 6. Verificación realizada

El `node_modules` no puede instalarse de forma fiable dentro de la carpeta de salida del entorno de verificación (el volumen no permite sobrescribir/eliminar archivos, y una instalación interrumpida deja binarios corruptos). Para validar el código sin ese problema, se copió el código fuente a un directorio temporal, se instaló ahí con `npm install` (342 paquetes) y se ejecutó:

- `npx vite build`: **compiló sin errores** (113 módulos, bundle final ~269 KB / 84 KB gzip).
- `npx eslint . --ext js,jsx`: **0 errores**, 1 advertencia esperada y no bloqueante (`react-refresh/only-export-components` en `AuthContext.jsx`, por exportar el hook `useAuth` junto al proveedor — patrón estándar de React).

Esto confirma que no hay errores de sintaxis, imports rotos, JSX inválido ni violaciones de las reglas de calidad configuradas. Las pruebas de comportamiento (formularios, rutas protegidas, mocks de API) se implementan en la Fase 5 con Vitest + React Testing Library, como exige el alcance.

**Nota operativa:** por la razón anterior, `frontend/node_modules` (visible en la carpeta de salida) puede contener una instalación parcial de una verificación previa; no forma parte del entregable y ya está excluida vía `frontend/.gitignore`. Ejecutar `npm install` de nuevo en un entorno normal la reemplaza sin problema.

## 7. Cómo ejecutar el frontend en desarrollo

```bash
cd frontend
npm install
cp .env.example .env   # ajustar VITE_API_URL si el backend no corre en localhost:8000
npm run dev              # http://localhost:5173
```

Requiere el backend de la Fase 3 corriendo (`uvicorn app.main:app --reload`) y una base de datos con el esquema de la Fase 2 aplicado.

## 8. Checklist de cierre de Fase 4

- [x] React 18 + Vite + TailwindCSS + Axios + React Router, según stack de Fase 1.
- [x] Módulo público: landing, especialidades, médicos, contacto, FAQ.
- [x] Módulo paciente: registro, login, perfil, agendar/consultar/cancelar citas.
- [x] Módulo administrador: dashboard, CRUD médicos/especialidades, gestión de citas y pacientes.
- [x] Rutas protegidas por autenticación y por rol.
- [x] Manejo centralizado de errores de API (interceptor Axios).
- [x] Diseño consistente con la paleta definida en Fase 1 (azules/blancos/grises, verde solo éxito).
- [x] Componentes reutilizables (`components/ui.jsx`), sin estilos improvisados.
- [x] Responsive (navegación con menú móvil, tablas con scroll horizontal, grids adaptables).
- [x] Build de producción y lint verificados sin errores.

**Aprobada por el cliente el 2026-08-07.** Fase 5 (Testing) desarrollada a continuación.
