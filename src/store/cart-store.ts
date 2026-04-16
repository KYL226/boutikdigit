import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  shopId: string
  shopName: string
}

interface CartState {
  items: CartItem[]
  shopId: string | null
  shopName: string | null
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shopId: null,
      shopName: null,

      addItem: (item: CartItem) => {
        const { items, shopId } = get()
        // If adding from a different shop, clear cart first
        if (shopId && shopId !== item.shopId) {
          set({ items: [item], shopId: item.shopId, shopName: item.shopName })
          return
        }
        const existing = items.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...items, item], shopId: item.shopId, shopName: item.shopName })
        }
      },

      removeItem: (productId: string) => {
        const { items } = get()
        const newItems = items.filter((i) => i.productId !== productId)
        if (newItems.length === 0) {
          set({ items: [], shopId: null, shopName: null })
        } else {
          set({ items: newItems })
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const { items } = get()
        set({
          items: items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [], shopId: null, shopName: null }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'boutique-cart',
    }
  )
)
