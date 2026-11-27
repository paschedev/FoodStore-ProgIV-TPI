from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    pass


class CredencialesIncorrectas(Exception):
    def __init__(self):
        super().__init__("Credenciales incorrectas")


class CuentaDesactivada(Exception):
    def __init__(self):
        super().__init__("Cuenta de usuario desactivada")


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(data.email):
                raise UsuarioDuplicado("El email ya está registrado")
            usuario = uow.usuarios.add(Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email.lower(),
                hashed_password=hash_password(data.password),
                role="user",
            ))
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesIncorrectas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token(data={"sub": usuario.username, "role": usuario.role})

    def obtener_por_username(self, username: str) -> UserPublic | None:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            return UserPublic.model_validate(usuario) if usuario else None
