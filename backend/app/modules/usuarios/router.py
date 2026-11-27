from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import AdminActual
from .schemas import UserPublic
from .service import UsuarioNoEncontrado, UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_admin: AdminActual, service: UsuarioServiceDep):
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(id: int, _admin: AdminActual, service: UsuarioServiceDep):
    try:
        return service.activar(id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(id: int, admin: AdminActual, service: UsuarioServiceDep):
    try:
        return service.desactivar(id, admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
