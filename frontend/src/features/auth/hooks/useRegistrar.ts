import { useMutation } from '@tanstack/react-query'
import { registrarUsuario } from '../api/auth'

export const useRegistrar = () =>
  useMutation({
    mutationFn: registrarUsuario,
  })
