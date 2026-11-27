from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from .schemas import ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate
from .service import ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ProductoServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
solo_admin = [Depends(require_role(["admin"]))]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ProductoServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{id}", response_model=ProductoRead)
def obtener_producto(id: int, service: ProductoServiceDep):
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=solo_admin)
def crear_producto(producto: ProductoCreate, service: ProductoServiceDep):
    try:
        return service.crear(producto)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{id}", response_model=ProductoRead, dependencies=solo_admin)
def actualizar_producto(id: int, producto: ProductoUpdate, service: ProductoServiceDep):
    try:
        return service.actualizar(id, producto)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{id}/stock", response_model=ProductoRead, dependencies=solo_admin)
def actualizar_stock(id: int, datos: ProductoStockUpdate, service: ProductoServiceDep):
    try:
        return service.actualizar_stock(id, datos)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=solo_admin)
def eliminar_producto(id: int, service: ProductoServiceDep):
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
