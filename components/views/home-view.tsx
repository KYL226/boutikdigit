'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { useCartStore } from '@/store/cart-store'
import { useFavoritesStore } from '@/store/favorites-store'
import { formatPrice, getCategoryIcon, getCategoryColor } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, ShoppingBag, ChevronRight, Package, Heart, Store } from 'lucide-react'
import { toast } from 'sonner'

interface Shop {
  id: string
  name: string
  description: string
  whatsappNumber: string
  image?: string
  location: string
  city: string
  category: string
  isActive: boolean
  user: { name: string }
  _count: { products: number }
}

const CATEGORIES = ['Alimentation', 'Électronique', 'Mode', 'Santé', 'Services']
const CITIES = ['Djibouti']

export default function HomeView() {
  const { setView, setSelectedShopId, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useAppStore()
  const router = useRouter()
  const { shopId: cartShopId } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  const fetchShops = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCategory) params.set('category', selectedCategory)
      const res = await fetch(`/api/shops?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setShops(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  const handleShopClick = (shopId: string) => {
    setSelectedShopId(shopId)
    setView('shop')
    router.push(`/shop/${shopId}`)
  }

  const handleToggleFavorite = (e: React.MouseEvent, shopId: string, shopName: string) => {
    e.stopPropagation()
    toggleFavorite(shopId)
    if (isFavorite(shopId)) {
      toast.success(`${shopName} retiré des favoris`)
    } else {
      toast.success(`${shopName} ajouté aux favoris ❤️`)
    }
  }

  const getShopColor = (name: string) => {
    const colors = [
      'from-orange-400 to-amber-400',
      'from-emerald-400 to-teal-400',
      'from-rose-400 to-pink-400',
      'from-violet-400 to-purple-400',
      'from-cyan-400 to-sky-400',
      'from-yellow-400 to-lime-400',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 md:p-10 text-white shadow-xl shadow-orange-200/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0yMGgtNjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-white/80">Bienvenue sur BoutikDigit</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
            Trouvez les meilleures<br />boutiques de votre quartier
          </h1>
          <p className="text-white/90 mb-6 text-sm md:text-base max-w-xl">
            Commandez facilement auprès des commerçants locaux. Livraison rapide, prix transparents, paiement à la livraison.
          </p>
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
            <Input
              placeholder="Rechercher une boutique ou un quartier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white/95 text-gray-900 border-0 shadow-lg placeholder:text-gray-400 rounded-xl text-base"
            />
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              {shops.length} boutiques
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Livraison locale
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={!selectedCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('')}
          className={`shrink-0 rounded-full ${
            !selectedCategory
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-200'
              : 'hover:bg-orange-50'
          }`}
        >
          Toutes
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
            className={`shrink-0 rounded-full ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-200'
                : 'hover:bg-orange-50'
            }`}
          >
            {getCategoryIcon(cat)} {cat}
          </Button>
        ))}
      </div>

      {/* Shops Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-orange-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune boutique trouvée</h3>
          <p className="text-muted-foreground text-sm">
            Essayez de modifier vos critères de recherche
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('')
            }}
            className="mt-4"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Card
              key={shop.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group border-0 shadow-sm hover:-translate-y-0.5"
              onClick={() => handleShopClick(shop.id)}
            >
              {/* Shop Image/Header */}
              <div className={`h-32 bg-gradient-to-br ${getShopColor(shop.name)} flex items-center justify-center relative`}>
                <span className="text-5xl font-bold text-white/80">{shop.name.charAt(0)}</span>
                <Badge className={`absolute top-3 left-3 ${getCategoryColor(shop.category)} text-xs`}>
                  {getCategoryIcon(shop.category)} {shop.category}
                </Badge>
                <button
                  onClick={(e) => handleToggleFavorite(e, shop.id, shop.name)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                >
                  <Heart className={`h-4 w-4 ${isFavorite(shop.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
                </button>
                {cartShopId === shop.id && (
                  <Badge className="absolute bottom-3 right-3 bg-orange-500 text-white text-xs shadow-md">
                    Panier actif
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                  {shop.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {shop.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {shop.location}, {shop.city}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    {shop._count.products}
                  </div>
                </div>
                <Button
                  className="w-full mt-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-200"
                  size="sm"
                >
                  Voir la boutique
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
