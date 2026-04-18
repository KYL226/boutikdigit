import { create } from 'zustand'
import { getSession, signIn, signOut } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  whatsapp?: string
  image?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  whatsapp?: string
  role: string
  shopName?: string
  shopDescription?: string
  shopWhatsappNumber?: string
  shopLocation?: string
  shopCity?: string
  shopCategory?: string
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        return { success: false, error: 'Email ou mot de passe incorrect' }
      }

      const session = await getSession()
      if (session?.user) {
        set({ user: session.user as User, isAuthenticated: true, isLoading: false })
        return { success: true }
      }

      return { success: false, error: 'Session non recuperee apres connexion' }
    } catch {
      return { success: false, error: 'Erreur de connexion au serveur' }
    }
  },

  register: async (data: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        // Auto-login after registration
        return await useAuthStore.getState().login(data.email, data.password)
      }

      const payload = await res.json().catch(() => null)
      return {
        success: false,
        error: payload?.error || "Erreur lors de la creation du compte",
      }
    } catch {
      return { success: false, error: 'Erreur de connexion au serveur' }
    }
  },

  logout: async () => {
    try {
      await signOut({ redirect: false })
    } finally {
      set({ user: null, isAuthenticated: false })
    }
  },

  checkSession: async () => {
    try {
      const session = await getSession()
      if (session?.user) {
        set({ user: session.user as User, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
