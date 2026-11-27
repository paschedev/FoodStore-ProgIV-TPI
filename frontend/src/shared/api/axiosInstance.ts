import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})

// El token viaja en la cookie HttpOnly y lo adjunta el navegador: solo se intercepta la respuesta.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const url = error.config?.url ?? ''
    const status = error.response?.status
    const esLoginOPerfil = url.includes('/auth/token') || url.includes('/auth/me')
    const cuentaDesactivada = status === 400 && error.response?.data?.detail === 'Cuenta de usuario desactivada'
    if ((status === 401 && !esLoginOPerfil) || cuentaDesactivada) {
      useAuthStore.getState().limpiarSesion()
    }
    return Promise.reject(error)
  },
)

export default api
