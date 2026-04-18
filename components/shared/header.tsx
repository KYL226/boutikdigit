'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { useFavoritesStore } from '@/store/favorites-store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  Store,
  ShoppingCart,
  Menu,
  LogOut,
  LayoutDashboard,
  Shield,
  User,
  Package,
  Heart,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { AppView } from '@/store/app-store'

interface NavItem {
  label: string
  view: AppView
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export default function Header() {
  const { currentView, setView } = useAppStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { getItemCount } = useCartStore()
  const { getCount: getFavCount } = useFavoritesStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const itemCount = getItemCount()
  const favCount = getFavCount()

  const navItems: NavItem[] = [
    { label: 'Accueil', view: 'home', icon: Store },
    { label: 'Favoris', view: 'favorites', icon: Heart, badge: favCount },
    { label: 'Panier', view: 'cart', icon: ShoppingCart, badge: itemCount },
  ]

  if (isAuthenticated && user?.role === 'MARCHAND') {
    navItems.push({ label: 'Tableau de bord', view: 'dashboard', icon: LayoutDashboard })
  }

  if (isAuthenticated && user?.role === 'ADMIN') {
    navItems.push({ label: 'Administration', view: 'admin', icon: Shield })
  }

  if (isAuthenticated) {
    navItems.push({ label: 'Commandes', view: 'orders', icon: Package })
  }

  const handleNavClick = (view: AppView) => {
    setView(view)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setView('home')
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-200">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            BoutikDigit
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavClick(item.view)}
              className={`relative ${
                currentView === item.view
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-200'
                  : 'hover:bg-orange-50'
              }`}
            >
              <item.icon className="h-4 w-4 mr-1.5" />
              {item.label}
              {item.badge ? (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center text-[10px] bg-orange-500 text-white border-2 border-white">
                  {item.badge}
                </Badge>
              ) : null}
            </Button>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-orange-50">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                  {user.role === 'MARCHAND' ? '🏪 Marchand' : user.role === 'ADMIN' ? '🛡️ Administrateur' : '🛍️ Client'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick('login')}
                className="hover:bg-orange-50"
              >
                Se connecter
              </Button>
              <Button
                size="sm"
                onClick={() => handleNavClick('register')}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-200"
              >
                Créer un compte
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-1 mt-6">
              {navItems.map((item) => (
                <Button
                  key={item.view}
                  variant={currentView === item.view ? 'default' : 'ghost'}
                  onClick={() => handleNavClick(item.view)}
                  className={`justify-start relative ${
                    currentView === item.view
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : 'hover:bg-orange-50'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {item.badge ? (
                    <Badge className="ml-auto h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center text-[10px] bg-orange-500 text-white">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Button>
              ))}
              <div className="border-t my-3" />
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium">{user.name}</div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavClick('login')}
                    className="justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Se connecter
                  </Button>
                  <Button
                    onClick={() => handleNavClick('register')}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white justify-start"
                  >
                    Créer un compte
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
