import { isAxiosError } from 'axios'

export const handleApiError = (error: unknown, porDefecto = 'Ocurrió un error inesperado'): string => {
  if (isAxiosError<{ detail?: unknown }>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor'
    if (error.response.status === 403) return 'No tenés permisos para realizar esta acción'
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return 'Revisá los datos ingresados'
  }
  return porDefecto
}
