import api from '@/shared/api/axiosInstance'
import type { MensajeRespuesta, RegistroDatos, Usuario } from '../types/auth.types'

export const iniciarSesion = async (username: string, password: string): Promise<MensajeRespuesta> => {
  const formulario = new URLSearchParams({ username, password })
  const { data } = await api.post<MensajeRespuesta>('/auth/token', formulario)
  return data
}

export const obtenerPerfil = async (): Promise<Usuario> => {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export const cerrarSesion = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const registrarUsuario = async (datos: RegistroDatos): Promise<Usuario> => {
  const { data } = await api.post<Usuario>('/auth/register', datos)
  return data
}
