import { Link, useNavigate } from 'react-router-dom'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'

function CarritoPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad)
  const quitar = useCartStore((state) => state.quitar)
  const vaciar = useCartStore((state) => state.vaciar)
  const total = useCartStore((state) => state.total)

  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-800">Carrito</h1>
        <EstadoVacio mensaje="Tu carrito está vacío.">
          <Link to="/" className="font-semibold text-blue-600 hover:underline">Ver el catálogo</Link>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">Carrito</h1>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-center">Cantidad</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.producto_id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700">{item.nombre}</td>
                <td className="px-4 py-3 text-right text-slate-600">{formatearPrecio(item.precio_unitario)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      aria-label={`Restar una unidad de ${item.nombre}`}
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                      className="h-8 w-8 rounded bg-slate-200 font-bold text-slate-700 hover:bg-slate-300"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <button
                      type="button"
                      aria-label={`Sumar una unidad de ${item.nombre}`}
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                      className="h-8 w-8 rounded bg-slate-200 font-bold text-slate-700 hover:bg-slate-300"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => quitar(item.producto_id)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow">
        <span className="text-lg font-bold text-slate-800">Total: {formatearPrecio(total())}</span>
        <div className="flex gap-2">
          <Button variante="secondary" onClick={vaciar}>Vaciar carrito</Button>
          <Button onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
        </div>
      </div>
    </section>
  )
}

export default CarritoPage
