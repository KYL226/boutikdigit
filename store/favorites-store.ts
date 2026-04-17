import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoriteStore {
  favoriteShopIds: string[]
  addFavorite: (shopId: string) => void
  removeFavorite: (shopId: string) => void
  isFavorite: (shopId: string) => boolean
  toggleFavorite: (shopId: string) => void
  getCount: () => number
}

export const useFavoritesStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favoriteShopIds: [],

      addFavorite: (shopId: string) => {
        const { favoriteShopIds } = get()
        if (!favoriteShopIds.includes(shopId)) {
          set({ favoriteShopIds: [...favoriteShopIds, shopId] })
        }
      },

      removeFavorite: (shopId: string) => {
        set({ favoriteShopIds: get().favoriteShopIds.filter((id) => id !== shopId) })
      },

      isFavorite: (shopId: string) => {
        return get().favoriteShopIds.includes(shopId)
      },

      toggleFavorite: (shopId: string) => {
        const { favoriteShopIds } = get()
        if (favoriteShopIds.includes(shopId)) {
          set({ favoriteShopIds: favoriteShopIds.filter((id) => id !== shopId) })
        } else {
          set({ favoriteShopIds: [...favoriteShopIds, shopId] })
        }
      },

      getCount: () => {
        return get().favoriteShopIds.length
      },
    }),
    {
      name: 'boutique-favorites',
    }
  )
)
