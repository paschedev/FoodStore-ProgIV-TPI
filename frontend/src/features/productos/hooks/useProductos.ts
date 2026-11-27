import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarProducto, actualizarStock, crearProducto, eliminarProducto, listarProductos } from '../api/productos'
import type { FiltrosProductos, ProductoDatos, StockDatos } from '../types/producto'

export const useProductos = (filtros: FiltrosProductos) =>
  useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData,
  })

const useInvalidarProductos = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['productos'] })
}

export const useCrearProducto = () => {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: crearProducto,
    onSuccess: invalidar,
  })
}

export const useActualizarProducto = () => {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<ProductoDatos> }) => actualizarProducto(id, datos),
    onSuccess: invalidar,
  })
}

export const useActualizarStock = () => {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: StockDatos }) => actualizarStock(id, datos),
    onSuccess: invalidar,
  })
}

export const useEliminarProducto = () => {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: invalidar,
  })
}
