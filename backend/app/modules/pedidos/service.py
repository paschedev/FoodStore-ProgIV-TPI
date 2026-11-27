from datetime import datetime, timezone
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic
from .models import DetallePedido, Pedido
from .schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork

TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, id: int):
        super().__init__(f"Pedido {id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self, id: int):
        super().__init__(f"El pedido {id} pertenece a otro usuario")


class ReglaDeNegocio(Exception):
    pass


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, id: int):
        super().__init__(f"El producto {id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int):
        super().__init__(f"Stock insuficiente para '{nombre}': quedan {stock} unidades")


class TransicionInvalida(ReglaDeNegocio):
    pass


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def _obtener_pedido(self, uow: PedidoUnitOfWork, id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(id)
        if pedido is None:
            raise PedidoNoEncontrado(id)
        return pedido

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            pedido = uow.pedidos.add(Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0,
            ))
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock)
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                ))
                total += subtotal
            pedido.total = round(total, 2)
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: UserPublic, skip: int, limit: int, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(usuario_id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_pedido(uow, id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno(id)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_pedido(uow, id)
            if data.estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(f"No se puede pasar un pedido de {pedido.estado} a {data.estado}")
            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = data.estado
            pedido.updated_at = ahora()
            return PedidoRead.model_validate(pedido)

    def cancelar(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_pedido(uow, id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno(id)
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se pueden cancelar pedidos en estado PENDIENTE")
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = ahora()
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio_del_dia = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado("ENTREGADO"), 2),
            )
