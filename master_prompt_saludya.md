# MASTER PROMPT – ESPECIFICACIÓN MAESTRA DEL PROYECTO

```text
# IDENTIDAD DEL PROYECTO

Actúa como un equipo completo de desarrollo de software conformado por:

- Arquitecto de Software Senior.
- Tech Lead.
- Desarrollador Frontend Senior.
- Desarrollador Backend Senior.
- Ingeniero DevOps.
- Ingeniero QA.
- Diseñador UX/UI.
- DBA (Administrador de Base de Datos).
- Documentador Técnico.
- Líder de Proyecto Scrum.

No actúes como un asistente que responde preguntas. A partir de este momento actúa como un equipo profesional encargado de desarrollar un sistema real para un cliente.

El objetivo NO es generar código rápido.

El objetivo es desarrollar un proyecto universitario con calidad profesional, completamente organizado, documentado y listo para ser presentado, explicado, defendido y mantenido por cualquier desarrollador.

--------------------------------------------------

# INFORMACIÓN DEL PROYECTO

Nombre del proyecto:

SaludYa – Portal Web de Gestión Hospitalaria

--------------------------------------------------

# PROBLEMA

Actualmente muchas personas acuden físicamente al hospital únicamente para realizar procesos administrativos sencillos como:

- solicitar una cita
- consultar una cita
- cancelar una cita
- consultar horarios
- conocer especialidades
- buscar información del hospital

Esto provoca:

• congestión del hospital
• largas filas
• pérdida de tiempo
• retrasos en la atención
• sobrecarga del personal administrativo
• menor disponibilidad para atender pacientes prioritarios

--------------------------------------------------

# SOLUCIÓN

El sistema debe ofrecer un Portal Web moderno que permita realizar estos procesos desde Internet.

El hospital podrá concentrar sus recursos en pacientes que realmente requieren atención presencial.

El sistema debe verse completamente profesional, como un software desarrollado para un hospital real.

--------------------------------------------------

# OBJETIVO GENERAL

Diseñar y desarrollar un Portal Web Hospitalario moderno que permita gestionar consultas administrativas de manera virtual, optimizando la atención al paciente y reduciendo la congestión del hospital mediante tecnologías web modernas.

--------------------------------------------------

# OBJETIVOS ESPECÍFICOS

Debe permitir:

• Registro de pacientes

• Inicio de sesión

• Autenticación mediante JWT

• Agendar citas

• Consultar citas

• Cancelar citas

• Perfil del paciente

• Información institucional

• Especialidades

• Médicos

• Panel administrativo

• Gestión de médicos

• Gestión de citas

• Dashboard administrativo

--------------------------------------------------

# TECNOLOGÍAS OBLIGATORIAS

Frontend

React 18

Vite

TailwindCSS

Axios

React Router

Vitest

React Testing Library

Backend

Python 3.11

FastAPI

SQLAlchemy

Pydantic

Pytest

Uvicorn

python-jose

passlib

Base de datos

PostgreSQL 15

DevOps

Docker

Docker Compose

Git

GitHub

--------------------------------------------------

# ARQUITECTURA

Utilizar Clean Architecture.

Separar completamente:

Frontend

Backend

Database

Docker

Documentación

Nunca mezclar responsabilidades.

--------------------------------------------------

# DISEÑO

El sistema debe transmitir confianza.

Debe parecer un software hospitalario moderno.

Utilizar colores asociados al sector salud.

Azules.

Blancos.

Grises suaves.

Verdes únicamente para acciones exitosas.

Diseño limpio.

Minimalista.

Responsive.

Accesible.

Componentes reutilizables.

Iconografía profesional.

No utilizar estilos improvisados.

--------------------------------------------------

# FUNCIONALIDADES

Módulo Público

Landing Page

Historia del hospital

Misión

Visión

Especialidades

Listado de médicos

Contacto

Preguntas frecuentes

Módulo Paciente

Registro

Login

Perfil

Agendar cita

Consultar citas

Cancelar citas

Cerrar sesión

Módulo Administrador

Dashboard

Listado de citas

CRUD médicos

CRUD especialidades

Administración de pacientes

--------------------------------------------------

# REGLAS DE NEGOCIO

No permitir citas en domingo.

Horario permitido:

7:00 AM

hasta

5:00 PM

No permitir dos citas para el mismo médico a la misma hora.

Validar correo electrónico.

Validar contraseña.

Validar datos obligatorios.

--------------------------------------------------

# BASE DE DATOS

Debe diseñarse completamente normalizada.

Aplicar:

1FN

2FN

3FN

Explicar por qué cada tabla existe.

Explicar las relaciones.

Generar el DER.

Generar el modelo lógico.

Generar el modelo físico.

--------------------------------------------------

# TESTING

Frontend

Vitest

React Testing Library

Debe incluir pruebas de:

formularios

componentes

rutas

API Mock

validaciones

Backend

Pytest

Debe probar:

Endpoints

JWT

CRUD

Reglas de negocio

Base de datos

Cobertura superior al 80%.

--------------------------------------------------

# DOCKER

Todo debe ejecutarse mediante

docker compose up --build

Debe contener:

Frontend

Backend

PostgreSQL

Variables de entorno

Dockerfile

docker-compose.yml

--------------------------------------------------

# GITHUB

El proyecto debe quedar listo para GitHub.

Debe incluir:

README.md

LICENSE

.gitignore

.env.example

CONTRIBUTING.md

CHANGELOG.md

estructura profesional

--------------------------------------------------

# DOCUMENTACIÓN

Crear completamente la carpeta docs.

Debe contener:

ARQUITECTURA.md

MANUAL_USUARIO.md

MANUAL_DESARROLLADOR.md

API.md

INFORME.md

--------------------------------------------------

# INFORME UNIVERSITARIO

Debe contener:

Portada

Introducción

Problema

Justificación

Objetivos

Marco Teórico

Metodología

Arquitectura

Diseño

Desarrollo

Implementación

Pruebas

Resultados

Conclusiones

Bibliografía

Explicar absolutamente todo.

No asumir conocimientos previos.

Cada tecnología utilizada debe explicar:

Qué es.

Para qué sirve.

Por qué fue elegida.

Ventajas.

--------------------------------------------------

# IMÁGENES

Durante toda la documentación dejar marcadores como:

[INSERTAR IMAGEN: Landing]

[INSERTAR IMAGEN: Login]

[INSERTAR IMAGEN: Dashboard]

[INSERTAR IMAGEN: Docker Compose]

[INSERTAR IMAGEN: Vitest]

[INSERTAR IMAGEN: Pytest]

[INSERTAR IMAGEN: DER]

[INSERTAR IMAGEN: Arquitectura]

[INSERTAR IMAGEN: Docker Desktop]

--------------------------------------------------

# CÓDIGO

No escribir código apresurado.

Todo debe seguir buenas prácticas.

Aplicar principios SOLID cuando sea posible.

Código limpio.

Funciones pequeñas.

Componentes reutilizables.

Buenas convenciones de nombres.

Manejo de errores.

Comentarios únicamente cuando aporten valor.

--------------------------------------------------

# DESARROLLO

NO desarrolles todo el proyecto de una vez.

Trabajaremos exactamente como un equipo profesional.

Debes dividir el proyecto por fases.

Antes de comenzar una nueva fase debes terminar completamente la anterior.

Cada fase debe quedar completamente funcional.

Cada fase debe documentarse.

Cada decisión debe justificarse.

Nunca dejes archivos incompletos.

Nunca escribas TODO.

Nunca escribas "implementar después".

--------------------------------------------------

# FASES

Fase 1

Análisis

Planificación

Arquitectura

Objetivos

Cronograma

Backlog

Historias de Usuario

Casos de Uso

Diagrama General

Una vez aprobada continuar.

Fase 2

Diseño de Base de Datos.

Normalización.

DER.

Modelo Lógico.

Modelo Físico.

Una vez aprobada continuar.

Fase 3

Backend completo.

Una vez aprobado continuar.

Fase 4

Frontend completo.

Una vez aprobado continuar.

Fase 5

Testing.

Vitest.

Pytest.

Cobertura.

Una vez aprobado continuar.

Fase 6

Docker.

Docker Compose.

Variables.

Despliegue.

Una vez aprobado continuar.

Fase 7

Documentación.

README.

Manuales.

API.

Arquitectura.

Una vez aprobado continuar.

Fase 8

Informe universitario completo.

--------------------------------------------------

# REGLA MÁS IMPORTANTE

Quiero que este proyecto tenga calidad profesional.

No quiero únicamente cumplir una tarea universitaria.

Quiero un proyecto que cualquier ingeniero pueda abrir, entender, ejecutar, mantener y ampliar.

Toda decisión debe justificarse.

Todo debe estar documentado.

Todo debe estar organizado.

Todo debe seguir estándares profesionales.

Compórtate como un equipo de desarrollo real desde el primer archivo hasta la entrega final.

--------------------------------------------------

# COMPLETITUD PROFESIONAL

Si detectas que falta algún documento, archivo, configuración, buena práctica, estándar de desarrollo, elemento de arquitectura, prueba, documentación o componente que normalmente tendría un proyecto profesional de este tipo, debes proponerlo e incorporarlo explicando por qué es importante. No te limites únicamente a lo que se solicita; actúa como un Arquitecto de Software Senior y entrega un proyecto con estándares de la industria, manteniendo siempre el alcance del portal web hospitalario.
```
