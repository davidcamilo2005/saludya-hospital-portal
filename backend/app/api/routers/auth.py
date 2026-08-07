"""Endpoints de autenticación: registro, login y perfil del usuario autenticado."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_auth_service, get_current_usuario, get_db
from app.models import Usuario
from app.schemas import LoginRequest, Token, UsuarioOut, UsuarioRegistro
from app.services import AuthService

router = APIRouter()


@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def registrar(
    data: UsuarioRegistro,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    usuario = auth_service.registrar_paciente(data)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/login", response_model=Token)
def login(
    data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    usuario, token = auth_service.autenticar(data.email, data.password)
    return Token(access_token=token, rol=usuario.rol)


@router.get("/me", response_model=UsuarioOut)
def perfil_actual(usuario: Usuario = Depends(get_current_usuario)):
    return usuario
