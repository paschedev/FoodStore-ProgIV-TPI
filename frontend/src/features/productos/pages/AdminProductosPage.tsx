import { useState, type FormEvent } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { useCategorias } from '@/features/categorias'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import Tabla from '@/shared/components/Tabla'
import Button from '@/shared/ui/Button'
import { formatearPrecio } from '@/shared/utils/formato'
import ProductoFormModal from '../components/ProductoFormModal'
import StockModal from '../components/StockModal'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto, ProductoDatos, StockDatos } from '../types/producto'

const columnHelper = createColumnHelper<Producto>()

const columnas = [
  columnHelper.accessor('id', { header: 'Número' }),
  columnHelper.accessor('nombre', { header: 'Nombre' }),
  columnHelper.accessor((producto) => producto.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
  columnHelper.accessor('precio_base', { header: 'Precio', cell: (info) => formatearPrecio(info.getValue()) }),
  columnHelper.accessor('stock', { header: 'Stock' }),
  columnHelper.accessor('disponible', {
    header: 'Disponible',
    cell: (info) =>
      info.getValue() ? (
        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Sí</span>
      ) : (
        <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">No</span>
      ),
  }),
]

const sinProductos: Producto[] = []

function AdminProductosPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [productoStock, setProductoStock] = useState<Producto | null>(null)
  const { data: categorias } = useCategorias()
  const { data, isPending, isError, refetch } = useProductos({
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    search: busqueda || undefined,
  })
  const crearMutation = useCrearProducto()
  const actualizarMutation = useActualizarProducto()
  const stockMutation = useActualizarStock()
  const eliminarMutation = useEliminarProducto()

  const table = useReactTable({
    data: data?.items ?? sinProductos,
    columns: columnas,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: data?.total ?? 0,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleBuscar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusqueda(texto.trim())
    setPagination((actual) => ({ ...actual, pageIndex: 0 }))
  }

  const abrirModal = (producto: Producto | null) => {
    crearMutation.reset()
    actualizarMutation.reset()
    setProductoSeleccionado(producto)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setProductoSeleccionado(null)
  }

  const abrirStock = (producto: Producto) => {
    stockMutation.reset()
    setProductoStock(producto)
  }

  const handleGuardar = (datos: ProductoDatos) => {
    if (productoSeleccionado) {
      actualizarMutation.mutate({ id: productoSeleccionado.id, datos }, { onSuccess: cerrarModal })
    } else {
      crearMutation.mutate(datos, { onSuccess: cerrarModal })
    }
  }

  const handleStock = (datos: StockDatos) => {
    if (!productoStock) return
    stockMutation.mutate({ id: productoStock.id, datos }, { onSuccess: () => setProductoStock(null) })
  }

  const handleEliminar = (producto: Producto) => {
    if (!window.confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) return
    eliminarMutation.mutate(producto.id)
  }

  const errorGuardar = crearMutation.error ?? actualizarMutation.error

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
        <Button onClick={() => abrirModal(null)} disabled={!categorias?.length}>+ Nuevo producto</Button>
      </div>
      <form onSubmit={handleBuscar} className="flex gap-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar producto"
          className="flex-1 rounded border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
        />
        <Button type="submit" variante="outline">Buscar</Button>
      </form>
      {eliminarMutation.error && (
        <EstadoError mensaje={handleApiError(eliminarMutation.error, 'No se pudo eliminar el producto')} />
      )}
      {isPending ? (
        <Skeleton cantidad={6} />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar los productos" onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay productos para mostrar." />
      ) : (
        <Tabla
          table={table}
          acciones={(producto) => (
            <>
              <Button variante="secondary" onClick={() => abrirStock(producto)}>Stock</Button>
              <Button variante="outline" onClick={() => abrirModal(producto)}>Editar</Button>
              <Button variante="danger" onClick={() => handleEliminar(producto)}>Eliminar</Button>
            </>
          )}
        />
      )}
      {modalAbierto && (
        <ProductoFormModal
          producto={productoSeleccionado}
          categorias={categorias ?? []}
          guardando={crearMutation.isPending || actualizarMutation.isPending}
          error={errorGuardar ? handleApiError(errorGuardar, 'No se pudo guardar el producto') : undefined}
          onSubmit={handleGuardar}
          onCerrar={cerrarModal}
        />
      )}
      {productoStock && (
        <StockModal
          producto={productoStock}
          guardando={stockMutation.isPending}
          error={stockMutation.error ? handleApiError(stockMutation.error, 'No se pudo actualizar el stock') : undefined}
          onSubmit={handleStock}
          onCerrar={() => setProductoStock(null)}
        />
      )}
    </section>
  )
}

export default AdminProductosPage
