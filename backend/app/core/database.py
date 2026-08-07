"""Configuración de SQLAlchemy: engine, sesión y dependencia get_db."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Clase base declarativa para todos los modelos ORM."""


def get_db() -> Generator:
    """Dependencia de FastAPI: entrega una sesión de BD y la cierra al finalizar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
