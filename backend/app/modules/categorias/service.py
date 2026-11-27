from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self, id: int):
        super().__init__(f"Categoría {id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def _obtener_activa(self, uow: CategoriaUnitOfWork, id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(id)
        return categoria

    def _verificar_nombre_unico(self, uow: CategoriaUnitOfWork, nombre: str, id: int | None = None) -> None:
        existente = uow.categorias.get_by_nombre(nombre)
        if existente and existente.id != id:
            raise NombreDuplicado(nombre)

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(categoria) for categoria in uow.categorias.list_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._obtener_activa(uow, id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._verificar_nombre_unico(uow, data.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(data))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "nombre" in cambios:
                self._verificar_nombre_unico(uow, cambios["nombre"], id)
            categoria.sqlmodel_update(cambios)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, id)
            categoria.activo = False
