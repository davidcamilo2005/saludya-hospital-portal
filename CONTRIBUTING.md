# Guía de contribución

Gracias por tu interés en SaludYa. Este es un proyecto académico, pero se
mantiene con el mismo cuidado que un repositorio profesional: cualquier
cambio debe ser legible, probado y documentado.

## Flujo de trabajo

1. Crea una rama a partir de `main` con un nombre descriptivo:
   `feature/agendar-recordatorios`, `fix/validacion-telefono`, `docs/manual-usuario`.
2. Haz commits pequeños y descriptivos (ver convención abajo).
3. Asegúrate de que la suite de pruebas pasa antes de abrir un Pull Request.
4. Abre el PR contra `main` describiendo **qué** cambia y **por qué**.

## Convención de commits

Se usa el formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance opcional>): <descripción corta en presente>

[cuerpo opcional explicando el porqué, no el qué]
```

Tipos usados en este proyecto: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`.

Ejemplos:

```
feat(citas): agregar filtro por especialidad en el panel admin
fix(backend): corregir índice único parcial de citas en schema.sql
docs(readme): actualizar instrucciones de docker compose
test(frontend): cubrir validación de contraseña en RegistroPage
```

## Backend (FastAPI)

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Linux/Mac: source .venv/bin/activate
pip install -r requirements-dev.txt
pytest                      # ejecuta la suite completa con cobertura
```

Reglas de estilo:

- Seguir la separación de capas ya existente: `routers` → `services` →
  `repositories` (interfaces) → `models`. Los routers nunca acceden a
  SQLAlchemy directamente.
- Los servicios lanzan excepciones de `app/domain/exceptions.py`, nunca
  `HTTPException` (esa traducción vive únicamente en `app/main.py`).
- Toda regla de negocio nueva debe tener su prueba correspondiente en `tests/`.

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev                 # servidor de desarrollo
npm test                    # suite de Vitest
npm run lint                # ESLint, debe salir sin errores
```

Reglas de estilo:

- Las páginas nunca llaman a Axios directamente: siempre a través de
  `src/api/endpoints.js`.
- Los estilos "sueltos" no están permitidos: usar los componentes de
  `src/components/ui.jsx` y la paleta ya definida (azul primario, verde
  solo para éxito).
- Toda validación de formulario reutilizable va en `src/utils/`, no
  embebida en el componente, para poder probarla de forma aislada.

## Reportar un problema

Abre un Issue describiendo: pasos para reproducir, comportamiento esperado
vs. observado, y (si aplica) el mensaje de error completo.
