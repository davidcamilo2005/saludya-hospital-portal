"""Pruebas unitarias de app/core/security.py: hashing y JWT."""

import pytest

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_hash_password_no_devuelve_texto_plano():
    hashed = hash_password("Clave1234")
    assert hashed != "Clave1234"
    assert hashed.startswith("$2b$")


def test_verify_password_correcta():
    hashed = hash_password("Clave1234")
    assert verify_password("Clave1234", hashed) is True


def test_verify_password_incorrecta():
    hashed = hash_password("Clave1234")
    assert verify_password("OtraClave1", hashed) is False


def test_create_and_decode_access_token():
    token = create_access_token(subject="42", rol="paciente")
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["rol"] == "paciente"


def test_decode_access_token_invalido():
    with pytest.raises(ValueError):
        decode_access_token("token-que-no-existe")


def test_decode_access_token_expirado(monkeypatch):
    from app.core import security as security_module

    monkeypatch.setattr(security_module.settings, "JWT_ACCESS_TOKEN_EXPIRE_MINUTES", -1)
    token = create_access_token(subject="1", rol="administrador")
    with pytest.raises(ValueError):
        decode_access_token(token)
