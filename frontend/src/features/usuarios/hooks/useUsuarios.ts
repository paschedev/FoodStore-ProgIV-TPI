import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuarios'

export const useUsuarios = () =>
  useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
  })

export const useActivarUsuario = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activarUsuario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}

export const useDesactivarUsuario = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}
