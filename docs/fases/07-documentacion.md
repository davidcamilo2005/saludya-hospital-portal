# SaludYa – Portal Web de Gestión Hospitalaria

## Fase 7 — Documentación

Estado: **Aprobada**.

---

## 1. Alcance

El master prompt del proyecto exige una carpeta `docs/` con
`ARQUITECTURA.md`, `MANUAL_USUARIO.md`, `MANUAL_DESARROLLADOR.md`,
`API.md` e `INFORME.md`. Se añadió además `docs/fases/`, que archiva
como registro histórico los documentos de las Fases 1 a 6 (el propio
proceso de desarrollo por fases es, en sí mismo, una entrega exigida
por el master prompt — sección "DESARROLLO").

## 2. Documentos entregados

| Documento | Público objetivo | Contenido |
|---|---|---|
| [`docs/ARQUITECTURA.md`](../ARQUITECTURA.md) | Desarrolladores, evaluadores técnicos | Clean Architecture, modelo de datos (DER, normalización), decisiones de diseño y sus justificaciones. |
| [`docs/API.md`](../API.md) | Desarrolladores frontend/integradores | Referencia completa de los 26 endpoints: método, ruta, rol requerido, payload, respuesta, códigos de error. |
| [`docs/MANUAL_USUARIO.md`](../MANUAL_USUARIO.md) | Pacientes y administradores finales | Guía paso a paso de cada funcionalidad, sin asumir conocimiento técnico. |
| [`docs/MANUAL_DESARROLLADOR.md`](../MANUAL_DESARROLLADOR.md) | Cualquier desarrollador que clone el repositorio | Puesta en marcha (con y sin Docker), estructura de carpetas, convenciones, solución de problemas comunes. |
| [`docs/GUIA_DE_PRUEBAS.md`](../GUIA_DE_PRUEBAS.md) | Quien necesite comprobar que el sistema funciona (entrega, demo, revisión) | Cómo verificar contenedores, logs, backend, base de datos y frontend; cómo correr y leer el resultado de las pruebas automatizadas; checklist y solución de problemas. Añadido después del cierre inicial de esta fase, a solicitud explícita, sin asumir conocimiento previo de Docker. |
| [`docs/INFORME.md`](../INFORME.md) | Evaluación académica | Informe universitario completo (Fase 8): portada, introducción, marco teórico, metodología, desarrollo, pruebas, resultados, conclusiones, bibliografía. |

## 3. Marcadores de imagen

Siguiendo la instrucción del master prompt (sección "IMÁGENES"), los
documentos que se benefician de capturas de pantalla incluyen
marcadores explícitos `[INSERTAR IMAGEN: ...]` en los puntos donde
deben insertarse antes de la entrega final (landing, login, dashboard,
Docker Compose corriendo, reporte de Vitest, reporte de Pytest, DER,
diagrama de arquitectura, Docker Desktop). Se documentan como
marcadores a propósito, no como contenido faltante: capturarlas
requiere ejecutar la aplicación (Docker) en un entorno interactivo, que
este entorno de desarrollo no tiene disponible.

## 4. Checklist de cierre de Fase 7

- [x] `docs/ARQUITECTURA.md`, `docs/API.md`, `docs/MANUAL_USUARIO.md`, `docs/MANUAL_DESARROLLADOR.md` completos.
- [x] `docs/fases/` con el historial completo de las Fases 1-6.
- [x] Marcadores de imagen en los puntos que el master prompt exige.
- [x] Referencias cruzadas entre `README.md` y `docs/` verificadas (enlaces relativos correctos).

**Aprobada por el cliente el 2026-08-07.** Fase 8 (Informe universitario) desarrollada a continuación.
