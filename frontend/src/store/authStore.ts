import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { cerrarSesion, iniciarSesion, obtenerPerfil } from '@/features/auth/api/auth'
import type { Usuario, UsuarioSesion } from '@/features/auth/types/auth.types'

type AuthState = {
  usuario: UsuarioSesion | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

const aUsuarioSesion = ({ id, username, full_name, email, role }: Usuario): UsuarioSesion => ({
  id,
  username,
  full_name,
  email,
  role,
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await iniciarSesion(username, password)
        const perfil = await obtenerPerfil()
        set({ usuario: aUsuarioSesion(perfil) })
      },

      logout: async () => {
        try {
          await cerrarSesion()
        } finally {
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const perfil = await obtenerPerfil()
          set({ usuario: aUsuarioSesion(perfil) })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
