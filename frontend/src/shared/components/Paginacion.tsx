type Props = {
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

function Paginacion({ pagina, totalPaginas, onCambiar }: Props) {
  const total = Math.max(totalPaginas, 1)
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-slate-600">
      <button
        type="button"
        onClick={() => onCambiar(pagina - 1)}
        disabled={pagina <= 0}
        className="rounded bg-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <span>
        Página {pagina + 1} de {total}
      </span>
      <button
        type="button"
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina + 1 >= total}
        className="rounded bg-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  )
}

export default Paginacion
