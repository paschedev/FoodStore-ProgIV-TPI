import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from '../api/categorias'
import type { CategoriaDatos } from '../types/categoria'

export const useCategorias = () =>
  useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
  })

export const useCrearCategoria = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export const useActualizarCategoria = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaDatos }) => actualizarCategoria(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export const useEliminarCategoria = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  })
}
