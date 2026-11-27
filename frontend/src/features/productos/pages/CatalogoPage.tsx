import { useState, type FormEvent } from 'react'
import { useCategorias } from '@/features/categorias'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import { useCartStore } from '@/store/cartStore'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'
import type { Producto } from '../types/producto'

const LIMITE = 8

function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const [agregado, setAgregado] = useState('')
  const agregar = useCartStore((state) => state.agregar)
  const { data: categorias } = useCategorias()
  const { data, isPending, isError, refetch } = useProductos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  })

  const handleBuscar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusqueda(texto.trim())
    setPagina(0)
  }

  const limpiarFiltros = () => {
    setTexto('')
    setBusqueda('')
    setCategoriaId(undefined)
    setPagina(0)
  }

  const handleAgregar = (producto: Producto) => {
    agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })
    setAgregado(`"${producto.nombre}" se agregó al carrito`)
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">Catálogo</h1>
      <form onSubmit={handleBuscar} className="flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar por nombre"
          className="min-w-48 flex-1 rounded border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
        />
        <select
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
          aria-label="Filtrar por categoría"
          className="rounded border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
          ))}
        </select>
        <Button type="submit">Buscar</Button>
      </form>
      {agregado && (
        <p className="rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{agregado}</p>
      )}
      {isPending ? (
        <Skeleton cantidad={LIMITE} alto="h-80" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" />
      ) : isError ? (
        <EstadoError mensaje="No se pudo cargar el catálogo" onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="No encontramos productos con esos filtros.">
          <Button variante="outline" onClick={limpiarFiltros}>Limpiar filtros</Button>
        </EstadoVacio>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} onAgregar={handleAgregar} />
            ))}
          </div>
          <div className="rounded-lg bg-white shadow">
            <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / LIMITE)} onCambiar={setPagina} />
          </div>
        </>
      )}
    </section>
  )
}

export default CatalogoPage
