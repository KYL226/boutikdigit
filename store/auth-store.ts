import { create } from 'zustand'

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
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
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
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }),
      })
      if (res.ok) {
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        if (session?.user) {
          set({ user: session.user as User, isAuthenticated: true })
          return true
        }
      }
      return false
    } catch {
      return false
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
        const loginSuccess = await useAuthStore.getState().login(data.email, data.password)
        return loginSuccess
      }
      return false
    } catch {
      return false
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } finally {
      set({ user: null, isAuthenticated: false })
    }
  },

  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/session')
      const session = await res.json()
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
