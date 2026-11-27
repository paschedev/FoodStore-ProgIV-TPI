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
import type { Usuario } from '@/features/auth'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import Tabla from '@/shared/components/Tabla'
import Button from '@/shared/ui/Button'
import { formatearFecha } from '@/shared/utils/formato'
import { useAuthStore } from '@/store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'

const columnHelper = createColumnHelper<Usuario>()

const columnas = [
  columnHelper.accessor('id', { header: 'Número' }),
  columnHelper.accessor('username', { header: 'Usuario' }),
  columnHelper.accessor('full_name', { header: 'Nombre' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('role', { header: 'Rol', cell: (info) => (info.getValue() === 'admin' ? 'Administrador' : 'Cliente') }),
  columnHelper.accessor('created_at', { header: 'Alta', cell: (info) => formatearFecha(info.getValue()) }),
  columnHelper.accessor('disabled', {
    header: 'Estado',
    cell: (info) =>
      info.getValue() ? (
        <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">Desactivado</span>
      ) : (
        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Activo</span>
      ),
  }),
]

const sinUsuarios: Usuario[] = []

function AdminUsuariosPage() {
  const usuarioActual = useAuthStore((state) => state.usuario)
  const { data, isPending, isError, refetch } = useUsuarios()
  const activarMutation = useActivarUsuario()
  const desactivarMutation = useDesactivarUsuario()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })

  const table = useReactTable({
    data: data ?? sinUsuarios,
    columns: columnas,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleDesactivar = (usuario: Usuario) => {
    if (!window.confirm(`¿Desactivar a "${usuario.username}"? No va a poder iniciar sesión hasta que se lo active.`)) return
    desactivarMutation.mutate(usuario.id)
  }

  const errorAccion = activarMutation.error ?? desactivarMutation.error

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
      {errorAccion && <EstadoError mensaje={handleApiError(errorAccion, 'No se pudo actualizar el usuario')} />}
      {isPending ? (
        <Skeleton cantidad={5} />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar los usuarios" onReintentar={() => refetch()} />
      ) : data.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios registrados." />
      ) : (
        <Tabla
          table={table}
          acciones={(usuario) =>
            usuario.id === usuarioActual?.id ? (
              <span className="text-xs text-slate-400">Tu cuenta</span>
            ) : usuario.disabled ? (
              <Button variante="outline" onClick={() => activarMutation.mutate(usuario.id)}>Activar</Button>
            ) : (
              <Button variante="danger" onClick={() => handleDesactivar(usuario)}>Desactivar</Button>
            )
          }
        />
      )}
    </section>
  )
}

export default AdminUsuariosPage
