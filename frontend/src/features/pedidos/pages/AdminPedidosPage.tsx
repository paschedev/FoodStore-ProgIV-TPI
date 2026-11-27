import { useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import Tabla from '@/shared/components/Tabla'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Modal from '@/shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import PedidoDetalle from '../components/PedidoDetalle'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const columnHelper = createColumnHelper<Pedido>()

const columnas = [
  columnHelper.accessor('id', { header: 'Número', enableSorting: false }),
  columnHelper.accessor('usuario_id', { header: 'Cliente', enableSorting: false, cell: (info) => `Usuario #${info.getValue()}` }),
  columnHelper.accessor('created_at', { header: 'Fecha', enableSorting: false, cell: (info) => formatearFecha(info.getValue()) }),
  columnHelper.accessor('estado', { header: 'Estado', enableSorting: false, cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
  columnHelper.accessor('total', { header: 'Total', enableSorting: false, cell: (info) => formatearPrecio(info.getValue()) }),
]

const textoAccion: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

const sinPedidos: Pedido[] = []

function AdminPedidosPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null)
  const { data, isPending, isError, refetch } = usePedidos({
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    estado,
  })
  const cambiarEstadoMutation = useCambiarEstadoPedido()

  const table = useReactTable({
    data: data?.items ?? sinPedidos,
    columns: columnas,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: data?.total ?? 0,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleCambiarEstado = (pedido: Pedido, nuevoEstado: EstadoPedido) => {
    if (nuevoEstado === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se va a devolver el stock.`)) return
    cambiarEstadoMutation.mutate({ id: pedido.id, estado: nuevoEstado })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <select
          value={estado ?? ''}
          onChange={(e) => {
            setEstado((e.target.value || undefined) as EstadoPedido | undefined)
            setPagination((actual) => ({ ...actual, pageIndex: 0 }))
          }}
          aria-label="Filtrar por estado"
          className="rounded border border-slate-300 bg-white px-3 py-2 focus:border-blue-600 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(({ valor, texto }) => (
            <option key={valor} value={valor}>{texto}</option>
          ))}
        </select>
      </div>
      {cambiarEstadoMutation.error && (
        <EstadoError mensaje={handleApiError(cambiarEstadoMutation.error, 'No se pudo cambiar el estado')} />
      )}
      {isPending ? (
        <Skeleton cantidad={6} />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar los pedidos" onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      ) : (
        <Tabla
          table={table}
          acciones={(pedido) => (
            <>
              <Button variante="secondary" onClick={() => setPedidoDetalle(pedido)}>Ver</Button>
              {TRANSICIONES[pedido.estado].map((siguiente) => (
                <Button
                  key={siguiente}
                  variante={siguiente === 'CANCELADO' ? 'danger' : 'primary'}
                  onClick={() => handleCambiarEstado(pedido, siguiente)}
                  disabled={cambiarEstadoMutation.isPending}
                >
                  {textoAccion[siguiente]}
                </Button>
              ))}
            </>
          )}
        />
      )}
      {pedidoDetalle && (
        <Modal titulo={`Pedido #${pedidoDetalle.id}`}>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Usuario #{pedidoDetalle.usuario_id} · {formatearFecha(pedidoDetalle.created_at)}</span>
            <BadgeEstado estado={pedidoDetalle.estado} />
          </div>
          <PedidoDetalle pedido={pedidoDetalle} />
          <div className="flex justify-end">
            <Button variante="secondary" onClick={() => setPedidoDetalle(null)}>Cerrar</Button>
          </div>
        </Modal>
      )}
    </section>
  )
}

export default AdminPedidosPage
