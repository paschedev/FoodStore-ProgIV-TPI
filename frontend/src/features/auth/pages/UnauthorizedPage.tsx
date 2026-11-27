import { Link } from 'react-router-dom'

function UnauthorizedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-800">Acceso denegado</h1>
      <p className="text-slate-600">No tenés permisos para ver esta página.</p>
      <Link to="/" className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
        Volver al inicio
      </Link>
    </div>
  )
}

export default UnauthorizedPage
