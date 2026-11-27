from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import UsuarioActual
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from .schemas import MensajeRespuesta
from .service import AuthService, CredencialesIncorrectas, CuentaDesactivada, UsuarioDuplicado

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(usuario: UserCreate, service: AuthServiceDep):
    try:
        return service.registrar(usuario)
    except UsuarioDuplicado as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/token", response_model=MensajeRespuesta)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: AuthServiceDep,
):
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesIncorrectas as e:
        raise HTTPException(status_code=401, detail=str(e), headers={"WWW-Authenticate": "Bearer"})
    except CuentaDesactivada as e:
        raise HTTPException(status_code=400, detail=str(e))
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # en producción, con HTTPS: True
    )
    return {"message": "Login exitoso"}


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response):
    response.delete_cookie("access_token", httponly=True, samesite="lax", secure=False)
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UserPublic)
def me(usuario: UsuarioActual):
    return usuario
