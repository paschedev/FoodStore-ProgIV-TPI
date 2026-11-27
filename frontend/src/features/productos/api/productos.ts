import api from '@/shared/api/axiosInstance'
import type { FiltrosProductos, Producto, ProductoDatos, ProductosPaginados, StockDatos } from '../types/producto'

export const listarProductos = async (filtros: FiltrosProductos): Promise<ProductosPaginados> => {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}

export const crearProducto = async (datos: ProductoDatos): Promise<Producto> => {
  const { data } = await api.post<Producto>('/productos', datos)
  return data
}

export const actualizarProducto = async (id: number, datos: Partial<ProductoDatos>): Promise<Producto> => {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos)
  return data
}

export const actualizarStock = async (id: number, datos: StockDatos): Promise<Producto> => {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos)
  return data
}

export const eliminarProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`)
}
