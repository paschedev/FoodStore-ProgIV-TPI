import { useState } from 'react'
import { formatearPrecio } from '@/shared/utils/formato'
import Button from '@/shared/ui/Button'
import type { Producto } from '../types/producto'

type Props = {
  producto: Producto
  onAgregar: (producto: Producto) => void
}

function ProductoCard({ producto, onAgregar }: Props) {
  const [imagenRota, setImagenRota] = useState(false)
  const sinStock = producto.stock === 0
  const vendible = producto.disponible && !sinStock

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-white shadow">
      {producto.imagen_url && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          onError={() => setImagenRota(true)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-slate-200 text-sm text-slate-500">Sin imagen</div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase text-blue-600">{producto.categoria.nombre}</span>
        <h3 className="font-semibold text-slate-800">{producto.nombre}</h3>
        <p className="flex-1 text-sm text-slate-600">{producto.descripcion}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-slate-800">{formatearPrecio(producto.precio_base)}</span>
          <span className="text-xs text-slate-500">
            {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `${producto.stock} disponibles`}
          </span>
        </div>
        <Button onClick={() => onAgregar(producto)} disabled={!vendible}>
          {vendible ? 'Agregar al carrito' : 'No disponible'}
        </Button>
      </div>
    </article>
  )
}

export default ProductoCard
