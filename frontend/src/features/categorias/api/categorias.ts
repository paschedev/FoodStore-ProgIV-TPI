import api from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaDatos } from '../types/categoria'

export const listarCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export const crearCategoria = async (datos: CategoriaDatos): Promise<Categoria> => {
  const { data } = await api.post<Categoria>('/categorias', datos)
  return data
}

export const actualizarCategoria = async (id: number, datos: CategoriaDatos): Promise<Categoria> => {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, datos)
  return data
}

export const eliminarCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`)
}
