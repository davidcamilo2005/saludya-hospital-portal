"""Excepciones de dominio.

Las capas de servicio (casos de uso) lanzan estas excepciones sin conocer
nada de HTTP. La capa de API (routers/main.py) las traduce a códigos de
estado HTTP mediante exception handlers. Esto mantiene el dominio
desacoplado del framework web (regla de dependencia de Clean Architecture).
"""


class DomainError(Exception):
    """Error base de negocio."""


class NotFoundError(DomainError):
    """El recurso solicitado no existe."""


class ConflictError(DomainError):
    """El recurso ya existe o hay un conflicto de estado (p. ej. horario ocupado)."""


class BusinessRuleError(DomainError):
    """Se violó una regla de negocio (p. ej. domingo, fuera de horario)."""


class UnauthorizedError(DomainError):
    """Credenciales inválidas o token inválido."""


class ForbiddenError(DomainError):
    """El usuario autenticado no tiene permisos para esta acción."""
