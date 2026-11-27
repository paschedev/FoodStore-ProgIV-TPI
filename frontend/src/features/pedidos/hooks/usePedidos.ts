import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido, cancelarPedido, crearPedido, listarPedidos, obtenerResumen } from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos } from '../types/pedido'

export const usePedidos = (filtros: FiltrosPedidos) =>
  useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })

export const useResumenPedidos = () =>
  useQuery({
    queryKey: ['pedidos', 'resumen'],
    queryFn: obtenerResumen,
  })

// Crear o cancelar un pedido cambia el stock, por eso también se invalidan los productos
const useInvalidarPedidos = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    queryClient.invalidateQueries({ queryKey: ['productos'] })
  }
}

export const useCrearPedido = () => {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: invalidar,
  })
}

export const useCambiarEstadoPedido = () => {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export const useCancelarPedido = () => {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: invalidar,
  })
}
