# =========================================================
# SaludYa API - Imagen de producción (FastAPI + Uvicorn)
# =========================================================
FROM python:3.11-slim AS base

# No generar .pyc y forzar salida sin buffer (logs visibles en `docker logs`).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dependencias del sistema requeridas por psycopg2 (driver de PostgreSQL).
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias primero (aprovecha la cache de capas de Docker:
# solo se reinstalan si requirements.txt cambia, no en cada cambio de código).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Usuario no root: buena práctica de seguridad para contenedores.
RUN useradd --create-home --shell /bin/bash appuser

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
