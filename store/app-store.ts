import { create } from 'zustand'

export type AppView = 
  | 'home' 
  | 'shop' 
  | 'cart' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'admin'
  | 'orders'
  | 'favorites'

interface AppState {
  currentView: AppView
  selectedShopId: string | null
  searchQuery: string
  selectedCategory: string
  selectedCity: string
  isLoading: boolean
  setView: (view: AppView) => void
  setSelectedShopId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  setSelectedCity: (city: string) => void
  setIsLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  selectedShopId: null,
  searchQuery: '',
  selectedCategory: '',
  selectedCity: '',
  isLoading: false,
  setView: (view) => set({ currentView: view }),
  setSelectedShopId: (id) => set({ selectedShopId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
