from fastapi import HTTPException
from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, id: int):
        super().__init__(f"Usuario {id} no encontrado")


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(usuario) for usuario in uow.usuarios.list_ordenados()]

    def activar(self, id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if usuario is None:
                raise UsuarioNoEncontrado(id)
            usuario.disabled = False
            return UserPublic.model_validate(usuario)

    def desactivar(self, id: int, admin_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if usuario is None:
                raise UsuarioNoEncontrado(id)
            if usuario.id == admin_id:
                raise HTTPException(status_code=400, detail="No podés desactivar tu propia cuenta")
            usuario.disabled = True
            return UserPublic.model_validate(usuario)
