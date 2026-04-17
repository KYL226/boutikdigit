'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { useFavoritesStore } from '@/store/favorites-store'
import { useCartStore } from '@/store/cart-store'
import { formatPrice, getCategoryIcon, getCategoryColor } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, MapPin, Package, ChevronRight, Trash2 } from 'lucide-react'
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

export default function FavoritesView() {
  const { setView, setSelectedShopId } = useAppStore()
  const { favoriteShopIds, removeFavorite } = useFavoritesStore()
  const { shopId: cartShopId } = useCartStore()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  const fetchShops = useCallback(async () => {
    if (favoriteShopIds.length === 0) {
      setShops([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/shops')
      if (res.ok) {
        const allShops: Shop[] = await res.json()
        const favShops = allShops.filter((s) => favoriteShopIds.includes(s.id))
        setShops(favShops)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [favoriteShopIds])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  const handleShopClick = (shopId: string) => {
    setSelectedShopId(shopId)
    setView('shop')
  }

  const handleRemoveFavorite = (e: React.MouseEvent, shopId: string, shopName: string) => {
    e.stopPropagation()
    removeFavorite(shopId)
    toast.success(`${shopName} retiré des favoris`)
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
        <h1 className="text-2xl font-bold">Mes favoris</h1>
        <Badge variant="secondary" className="text-xs">
          {shops.length} boutique{shops.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
            <Heart className="h-10 w-10 text-rose-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun favori</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Ajoutez vos boutiques préférées en cliquant sur le cœur
          </p>
          <Button
            onClick={() => setView('home')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
          >
            Explorer les boutiques
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Card
              key={shop.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group border-0 shadow-sm relative"
              onClick={() => handleShopClick(shop.id)}
            >
              <button
                onClick={(e) => handleRemoveFavorite(e, shop.id, shop.name)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              </button>
              <div className={`h-32 bg-gradient-to-br ${getShopColor(shop.name)} flex items-center justify-center relative`}>
                <span className="text-5xl font-bold text-white/80">{shop.name.charAt(0)}</span>
                <Badge className={`absolute top-3 left-3 ${getCategoryColor(shop.category)} text-xs`}>
                  {getCategoryIcon(shop.category)} {shop.category}
                </Badge>
                {cartShopId === shop.id && (
                  <Badge className="absolute bottom-3 right-3 bg-orange-500 text-white text-xs">
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
                  className="w-full mt-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
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
