import type { ReactNode } from 'react'
import { flexRender, type Table } from '@tanstack/react-table'
import Paginacion from './Paginacion'

type Props<T> = {
  table: Table<T>
  acciones?: (fila: T) => ReactNode
}

function Tabla<T>({ table, acciones }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3">
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="font-semibold uppercase hover:text-slate-800"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? null}
                    </button>
                  ) : (
                    <span className="font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                  )}
                </th>
              ))}
              {acciones && <th className="px-4 py-3 text-right font-semibold">Acciones</th>}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-slate-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              {acciones && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">{acciones(row.original)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion
        pagina={table.getState().pagination.pageIndex}
        totalPaginas={table.getPageCount()}
        onCambiar={(pagina) => table.setPageIndex(pagina)}
      />
    </div>
  )
}

export default Tabla
