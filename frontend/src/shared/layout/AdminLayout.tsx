import { NavLink, Outlet } from 'react-router-dom'

const secciones = [
  { ruta: 'resumen', texto: 'Resumen' },
  { ruta: 'pedidos', texto: 'Pedidos' },
  { ruta: 'productos', texto: 'Productos' },
  { ruta: 'categorias', texto: 'Categorías' },
  { ruta: 'usuarios', texto: 'Usuarios' },
]

function AdminLayout() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-300 pb-3">
        {secciones.map((seccion) => (
          <NavLink
            key={seccion.ruta}
            to={seccion.ruta}
            className={({ isActive }) =>
              `rounded px-3 py-1.5 text-sm font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200'
              }`
            }
          >
            {seccion.texto}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}

export default AdminLayout
