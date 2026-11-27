type Props = {
  mensaje: string
  onReintentar?: () => void
}

function EstadoError({ mensaje, onReintentar }: Props) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <p>{mensaje}</p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="rounded border border-red-300 px-3 py-1 font-medium hover:bg-red-100"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

export default EstadoError
