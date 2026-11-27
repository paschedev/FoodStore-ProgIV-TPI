import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-blue-300' : 'hover:text-blue-300'

function Navbar() {
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  const unidades = useCartStore((state) => state.items.reduce((acumulado, item) => acumulado + item.cantidad, 0))
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-slate-800 text-white shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-xl font-bold">Food Store</Link>
        <div className="flex flex-wrap items-center gap-4">
          <NavLink to="/" end className={claseLink}>Catálogo</NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito{unidades > 0 && <span className="ml-1 rounded-full bg-blue-600 px-2 text-xs">{unidades}</span>}
          </NavLink>
          {usuario && <NavLink to="/mis-pedidos" className={claseLink}>Mis pedidos</NavLink>}
          {usuario?.role === 'admin' && <NavLink to="/admin" className={claseLink}>Panel</NavLink>}
          {usuario ? (
            <>
              <span className="text-sm text-slate-300">
                {usuario.full_name} ({usuario.role})
              </span>
              <button onClick={handleLogout} className="rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>Ingresar</NavLink>
              <NavLink to="/register" className={claseLink}>Registrarse</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
