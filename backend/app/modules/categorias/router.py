from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


CategoriaServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
solo_admin = [Depends(require_role(["admin"]))]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: CategoriaServiceDep):
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead)
def obtener_categoria(id: int, service: CategoriaServiceDep):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=solo_admin)
def crear_categoria(categoria: CategoriaCreate, service: CategoriaServiceDep):
    try:
        return service.crear(categoria)
    except NombreDuplicado as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.put("/{id}", response_model=CategoriaRead, dependencies=solo_admin)
def actualizar_categoria(id: int, categoria: CategoriaUpdate, service: CategoriaServiceDep):
    try:
        return service.actualizar(id, categoria)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=solo_admin)
def eliminar_categoria(id: int, service: CategoriaServiceDep):
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))
