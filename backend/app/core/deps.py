from typing import Annotated
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get("access_token")
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=401, detail="No autenticado", headers={"WWW-Authenticate": "Bearer"}
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str | None = payload.get("sub")
    if username is None:
        raise credentials_exception
    usuario = AuthService(UsuarioUnitOfWork()).obtener_por_username(username)
    if usuario is None:
        raise credentials_exception
    return usuario


def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
    return current_user


def require_role(allowed_roles: list[str]):
    def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Permisos insuficientes. Se requiere uno de los roles: {allowed_roles}",
            )
        return current_user

    return role_checker


UsuarioActual = Annotated[UserPublic, Depends(get_current_active_user)]
AdminActual = Annotated[UserPublic, Depends(require_role(["admin"]))]
