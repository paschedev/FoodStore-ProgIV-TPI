export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'

export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

export interface PedidoCrear {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas?: string
}

export interface FiltrosPedidos {
  skip: number
  limit: number
  estado?: EstadoPedido
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

// Mismas transiciones que valida el backend
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export const ESTADOS: { valor: EstadoPedido; texto: string }[] = [
  { valor: 'PENDIENTE', texto: 'Pendiente' },
  { valor: 'EN_PREPARACION', texto: 'En preparación' },
  { valor: 'ENTREGADO', texto: 'Entregado' },
  { valor: 'CANCELADO', texto: 'Cancelado' },
]
