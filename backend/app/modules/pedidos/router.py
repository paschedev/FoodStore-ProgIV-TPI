from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import AdminActual, UsuarioActual
from app.modules.productos.service import ProductoNoEncontrado
from .schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .service import PedidoAjeno, PedidoNoEncontrado, PedidoService, ReglaDeNegocio
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


PedidoServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(pedido: PedidoCreate, usuario: UsuarioActual, service: PedidoServiceDep):
    try:
        return service.crear(pedido, usuario.id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: UsuarioActual,
    service: PedidoServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, skip, limit, estado)


# Se declara antes de /{id} para que "resumen" no se interprete como un id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminActual, service: PedidoServiceDep):
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(id: int, usuario: UsuarioActual, service: PedidoServiceDep):
    try:
        return service.obtener(id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(id: int, datos: CambioEstado, _admin: AdminActual, service: PedidoServiceDep):
    try:
        return service.cambiar_estado(id, datos)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(id: int, usuario: UsuarioActual, service: PedidoServiceDep):
    try:
        return service.cancelar(id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status_code=400, detail=str(e))
