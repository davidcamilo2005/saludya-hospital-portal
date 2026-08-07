"""Punto de entrada de la API SaludYa.

Registra middleware (CORS), exception handlers (traducen excepciones de
dominio a respuestas HTTP), el endpoint de health check y todos los
routers de recursos.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routers import auth, citas, dashboard, especialidades, medicos, pacientes
from app.core.config import settings
from app.domain.exceptions import (
    BusinessRuleError,
    ConflictError,
    DomainError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="API REST del Portal Web de Gestión Hospitalaria SaludYa.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _error_response(status_code: int):
    def handler(request: Request, exc: DomainError):
        return JSONResponse(status_code=status_code, content={"detail": str(exc)})

    return handler


app.add_exception_handler(NotFoundError, _error_response(404))
app.add_exception_handler(ConflictError, _error_response(409))
app.add_exception_handler(BusinessRuleError, _error_response(422))
app.add_exception_handler(UnauthorizedError, _error_response(401))
app.add_exception_handler(ForbiddenError, _error_response(403))


@app.get("/health", tags=["health"])
def health_check():
    """Usado por Docker Compose (Fase 6) para verificar que la API está viva."""
    return {"status": "ok"}


app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["auth"])
app.include_router(pacientes.router, prefix=f"{settings.API_V1_PREFIX}/pacientes", tags=["pacientes"])
app.include_router(medicos.router, prefix=f"{settings.API_V1_PREFIX}/medicos", tags=["medicos"])
app.include_router(
    especialidades.router, prefix=f"{settings.API_V1_PREFIX}/especialidades", tags=["especialidades"]
)
app.include_router(citas.router, prefix=f"{settings.API_V1_PREFIX}/citas", tags=["citas"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_PREFIX}/dashboard", tags=["dashboard"])
