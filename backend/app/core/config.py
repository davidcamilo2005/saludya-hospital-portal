"""Configuración de la aplicación leída desde variables de entorno.

Se usa pydantic-settings en lugar de leer os.environ manualmente para
obtener validación de tipos y un único punto de verdad para la
configuración (ver Fase 1, sección 13: "Variables de entorno tipadas").
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "SaludYa API"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+psycopg2://saludya:saludya@localhost:5432/saludya"

    JWT_SECRET_KEY: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Reglas de negocio de citas (Fase 1)
    APPOINTMENT_START_HOUR: int = 7
    APPOINTMENT_END_HOUR: int = 17


settings = Settings()
