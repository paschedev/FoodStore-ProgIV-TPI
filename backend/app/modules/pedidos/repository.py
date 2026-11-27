from datetime import datetime
from sqlmodel import Session, col, func, select
from app.core.base_repository import BaseRepository
from .models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        usuario_id: int | None,
        skip: int,
        limit: int,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        consulta = select(Pedido).where(*filtros).order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        return total, list(self.session.exec(consulta).all())

    def count_by_estado(self, estado: str) -> int:
        consulta = select(func.count(col(Pedido.id))).where(Pedido.estado == estado)
        return self.session.exec(consulta).one()

    def count_desde(self, desde: datetime) -> int:
        consulta = select(func.count(col(Pedido.id))).where(Pedido.created_at >= desde)
        return self.session.exec(consulta).one()

    def sum_total_by_estado(self, estado: str) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(consulta).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)
