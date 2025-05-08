import { create } from 'zustand'

interface User {
  name: string | null
  email: string | null
  image: string | null
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthStore>((set) => ({
  user: {
    name: "Usuario de Ejemplo",
    email: "usuario@ejemplo.com",
    image: null
  },
  isLoading: false,
  setUser: (user) => set({ user }),
  signIn: async () => {
    set({ isLoading: true })
    // Aquí iría tu lógica de autenticación real
    set({ 
      user: {
        name: "Usuario de Ejemplo",
        email: "usuario@ejemplo.com",
        image: null
      },
      isLoading: false 
    })
  },
  signOut: async () => {
    set({ isLoading: true })
    // Aquí iría tu lógica de cierre de sesión
    set({ user: null, isLoading: false })
  }
}))
