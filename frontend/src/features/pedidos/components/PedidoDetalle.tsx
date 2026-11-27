import { formatearPrecio } from '@/shared/utils/formato'
import type { Pedido } from '../types/pedido'

type Props = {
  pedido: Pedido
}

function PedidoDetalle({ pedido }: Props) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2">Producto</th>
              <th className="py-2 text-right">Precio</th>
              <th className="py-2 text-right">Cant.</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item) => (
              <tr key={item.producto_id} className="border-t border-slate-100">
                <td className="py-2 text-slate-700">{item.nombre_producto}</td>
                <td className="py-2 text-right text-slate-600">{formatearPrecio(item.precio_unitario)}</td>
                <td className="py-2 text-right text-slate-600">{item.cantidad}</td>
                <td className="py-2 text-right font-medium text-slate-700">{formatearPrecio(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="grid gap-1 text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="inline font-semibold">Entrega: </dt>
          <dd className="inline">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Pago: </dt>
          <dd className="inline">{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="inline font-semibold">Notas: </dt>
            <dd className="inline">{pedido.notas}</dd>
          </div>
        )}
      </dl>
      <p className="text-right text-base font-bold text-slate-800">Total: {formatearPrecio(pedido.total)}</p>
    </div>
  )
}

export default PedidoDetalle
