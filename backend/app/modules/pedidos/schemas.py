from datetime import datetime, timezone
from typing import Annotated, Literal
from pydantic import StringConstraints, field_validator
from sqlmodel import SQLModel, Field

FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=200)]
    notas: str | None = Field(default=None, max_length=500)


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]

    # Las fechas se guardan en UTC pero la base las devuelve sin zona horaria
    @field_validator("created_at", "updated_at")
    @classmethod
    def con_zona_utc(cls, valor: datetime) -> datetime:
        return valor if valor.tzinfo else valor.replace(tzinfo=timezone.utc)


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
