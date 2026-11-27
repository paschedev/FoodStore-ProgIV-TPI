import { useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import Tabla from '@/shared/components/Tabla'
import Button from '@/shared/ui/Button'
import CategoriaFormModal from '../components/CategoriaFormModal'
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria, CategoriaDatos } from '../types/categoria'

const columnHelper = createColumnHelper<Categoria>()

const columnas = [
  columnHelper.accessor('id', { header: 'Número' }),
  columnHelper.accessor('nombre', { header: 'Nombre' }),
  columnHelper.accessor('descripcion', { header: 'Descripción', cell: (info) => info.getValue() || '—' }),
]

const sinCategorias: Categoria[] = []

function AdminCategoriasPage() {
  const { data, isPending, isError, refetch } = useCategorias()
  const crearMutation = useCrearCategoria()
  const actualizarMutation = useActualizarCategoria()
  const eliminarMutation = useEliminarCategoria()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })

  const table = useReactTable({
    data: data ?? sinCategorias,
    columns: columnas,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const abrirModal = (categoria: Categoria | null) => {
    crearMutation.reset()
    actualizarMutation.reset()
    setCategoriaSeleccionada(categoria)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setCategoriaSeleccionada(null)
  }

  const handleGuardar = (datos: CategoriaDatos) => {
    if (categoriaSeleccionada) {
      actualizarMutation.mutate({ id: categoriaSeleccionada.id, datos }, { onSuccess: cerrarModal })
    } else {
      crearMutation.mutate(datos, { onSuccess: cerrarModal })
    }
  }

  const handleEliminar = (categoria: Categoria) => {
    const mensaje = `¿Dar de baja la categoría "${categoria.nombre}"? Sus productos siguen en el catálogo hasta que los des de baja.`
    if (!window.confirm(mensaje)) return
    eliminarMutation.mutate(categoria.id)
  }

  const errorGuardar = crearMutation.error ?? actualizarMutation.error

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
        <Button onClick={() => abrirModal(null)}>+ Nueva categoría</Button>
      </div>
      {eliminarMutation.error && (
        <EstadoError mensaje={handleApiError(eliminarMutation.error, 'No se pudo eliminar la categoría')} />
      )}
      {isPending ? (
        <Skeleton cantidad={5} />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar las categorías" onReintentar={() => refetch()} />
      ) : data.length === 0 ? (
        <EstadoVacio mensaje="No hay categorías cargadas." />
      ) : (
        <Tabla
          table={table}
          acciones={(categoria) => (
            <>
              <Button variante="outline" onClick={() => abrirModal(categoria)}>Editar</Button>
              <Button variante="danger" onClick={() => handleEliminar(categoria)}>Eliminar</Button>
            </>
          )}
        />
      )}
      {modalAbierto && (
        <CategoriaFormModal
          categoria={categoriaSeleccionada}
          guardando={crearMutation.isPending || actualizarMutation.isPending}
          error={errorGuardar ? handleApiError(errorGuardar, 'No se pudo guardar la categoría') : undefined}
          onSubmit={handleGuardar}
          onCerrar={cerrarModal}
        />
      )}
    </section>
  )
}

export default AdminCategoriasPage
