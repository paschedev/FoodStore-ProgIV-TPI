import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/features/auth'
import { useAuthStore } from '@/store/authStore'

type Props = {
  allowedRoles?: Rol[]
}

function ProtectedRoute({ allowedRoles }: Props) {
  const usuario = useAuthStore((state) => state.usuario)
  const cargando = useAuthStore((state) => state.cargando)
  const location = useLocation()

  if (cargando) {
    return <p className="p-8 text-center text-slate-500">Verificando sesión...</p>
  }

  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
