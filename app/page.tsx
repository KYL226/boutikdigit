'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import HomeView from '@/components/views/home-view'
import ShopView from '@/components/views/shop-view'
import CartView from '@/components/views/cart-view'
import LoginView from '@/components/views/login-view'
import RegisterView from '@/components/views/register-view'
import DashboardView from '@/components/views/dashboard-view'
import AdminView from '@/components/views/admin-view'
import OrdersView from '@/components/views/orders-view'
import FavoritesView from '@/components/views/favorites-view'

function ViewRenderer() {
  const { currentView } = useAppStore()

  const views: Record<string, React.ReactNode> = {
    home: <HomeView />,
    shop: <ShopView />,
    cart: <CartView />,
    login: <LoginView />,
    register: <RegisterView />,
    dashboard: <DashboardView />,
    admin: <AdminView />,
    orders: <OrdersView />,
    favorites: <FavoritesView />,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {views[currentView] || <HomeView />}
      </motion.div>
    </AnimatePresence>
  )
}

export default function HomePage() {
  const { checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <ViewRenderer />
      </main>
      <Footer />
    </div>
  )
}
