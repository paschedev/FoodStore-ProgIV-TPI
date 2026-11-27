import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import PedidoDetalle from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS, type EstadoPedido, type Pedido } from '../types/pedido'

const LIMITE = 5

function MisPedidosPage() {
  const location = useLocation()
  const pedidoCreado = (location.state as { pedidoCreado?: number } | null)?.pedidoCreado
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [abierto, setAbierto] = useState<number | null>(pedidoCreado ?? null)
  const { data, isPending, isError, refetch } = usePedidos({ skip: pagina * LIMITE, limit: LIMITE, estado })
  const cancelarMutation = useCancelarPedido()

  const handleCancelar = (pedido: Pedido) => {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) return
    cancelarMutation.mutate(pedido.id)
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Mis pedidos</h1>
        <select
          value={estado ?? ''}
          onChange={(e) => {
            setEstado((e.target.value || undefined) as EstadoPedido | undefined)
            setPagina(0)
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
      {pedidoCreado && (
        <p className="rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          ¡Listo! Registramos tu pedido #{pedidoCreado}.
        </p>
      )}
      {cancelarMutation.error && (
        <EstadoError mensaje={handleApiError(cancelarMutation.error, 'No se pudo cancelar el pedido')} />
      )}
      {isPending ? (
        <Skeleton cantidad={LIMITE} alto="h-16" />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar tus pedidos" onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje={estado ? 'No tenés pedidos en ese estado.' : 'Todavía no hiciste ningún pedido.'} />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((pedido) => (
              <li key={pedido.id} className="rounded-lg bg-white shadow">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">Pedido #{pedido.id}</span>
                    <span className="text-xs text-slate-500">{formatearFecha(pedido.created_at)}</span>
                  </div>
                  <BadgeEstado estado={pedido.estado} />
                  <span className="font-bold text-slate-800">{formatearPrecio(pedido.total)}</span>
                  <div className="flex gap-2">
                    {pedido.estado === 'PENDIENTE' && (
                      <Button
                        variante="danger"
                        onClick={() => handleCancelar(pedido)}
                        disabled={cancelarMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button variante="outline" onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}>
                      {abierto === pedido.id ? 'Ocultar' : 'Ver detalle'}
                    </Button>
                  </div>
                </div>
                {abierto === pedido.id && (
                  <div className="border-t border-slate-100 p-4">
                    <PedidoDetalle pedido={pedido} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-white shadow">
            <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / LIMITE)} onCambiar={setPagina} />
          </div>
        </>
      )}
    </section>
  )
}

export default MisPedidosPage
