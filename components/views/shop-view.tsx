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
import { toast } from 'sonner'
import {
  ArrowLeft,
  MapPin,
  Phone,
  ShoppingCart,
  Plus,
  Minus,
  MessageCircle,
  Package,
  Heart,
  Search,
  Star,
} from 'lucide-react'

interface ShopData {
  id: string
  name: string
  description: string
  whatsappNumber: string
  image?: string
  logoUrl?: string | null
  bannerUrl?: string | null
  logoFallback?: { type: 'initials'; initials: string } | null
  location: string
  city: string
  category: string
  isActive: boolean
  user: { name: string }
  rating?: number | null
  products: ProductData[]
}

interface ProductData {
  id: string
  name: string
  description: string
  price: number
  image?: string
  primaryImage?: string | null
  imageFallback?: { type: 'initials'; initials: string } | null
  rating?: number | null
  isAvailable: boolean
  category: string
}

interface ShopViewProps {
  shopId?: string
}

export default function ShopView({ shopId: shopIdProp }: ShopViewProps) {
  const { selectedShopId } = useAppStore()
  const router = useRouter()
  const { addItem, items, shopId: cartShopId, getItemCount } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const [shop, setShop] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [shopRating, setShopRating] = useState(0)
  const itemCount = getItemCount()

  const activeShopId = shopIdProp || selectedShopId

  const fetchShop = useCallback(async () => {
    if (!activeShopId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/shops/${activeShopId}`)
      if (res.ok) {
        const data = await res.json()
        setShop(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [activeShopId])

  useEffect(() => {
    fetchShop()
  }, [fetchShop])

  const handleAddToCart = (product: ProductData) => {
    if (!shop || !product.isAvailable) return
    setAddingId(product.id)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || undefined,
      shopId: shop.id,
      shopName: shop.name,
    })
    toast.success(`${product.name} ajouté au panier`)
    setTimeout(() => setAddingId(null), 500)
  }

  const handleToggleFavorite = () => {
    if (!shop) return
    toggleFavorite(shop.id)
    if (isFavorite(shop.id)) {
      toast.success(`${shop.name} retiré des favoris`)
    } else {
      toast.success(`${shop.name} ajouté aux favoris ❤️`)
    }
  }

  const handleRateShop = async (rating: number) => {
    if (!shop) return
    try {
      const res = await fetch('/api/reviews/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, rating }),
      })
      if (!res.ok) {
        const payload = await res.json()
        toast.error(payload.error || 'Impossible d’enregistrer votre note')
        return
      }
      setShopRating(rating)
      toast.success('Merci pour votre avis sur la boutique')
      await fetchShop()
    } catch {
      toast.error('Erreur lors de l’envoi de la note')
    }
  }

  const handleRateProduct = async (productId: string, rating: number) => {
    try {
      const res = await fetch('/api/reviews/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating }),
      })
      if (!res.ok) {
        const payload = await res.json()
        toast.error(payload.error || 'Impossible d’enregistrer la note produit')
        return
      }
      toast.success('Merci pour votre avis produit')
      await fetchShop()
    } catch {
      toast.error('Erreur lors de l’envoi de la note')
    }
  }

  const getItemQuantity = (productId: string) => {
    return items.find((i) => i.productId === productId)?.quantity || 0
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton className="h-24 w-full rounded-t-lg" />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Boutique introuvable</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Retour à l&apos;accueil
        </Button>
      </div>
    )
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

  const visibleProducts = shop.products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(productSearch.toLowerCase())
  )

  const availableProducts = visibleProducts.filter((p) => p.isAvailable)
  const unavailableProducts = visibleProducts.filter((p) => !p.isAvailable)

  return (
    <div className="space-y-6 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/')}
        className="hover:bg-orange-50 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour
      </Button>

      {/* Shop Header */}
      <div
        className={`rounded-2xl bg-gradient-to-br ${getShopColor(shop.name)} p-6 md:p-8 text-white relative overflow-hidden shadow-xl`}
        style={
          shop.bannerUrl
            ? {
                backgroundImage: `url(${shop.bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* overlay pour garder la lisibilité du texte sur bannière */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0yMGgtNjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
              {shop.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shop.logoUrl} alt={`Logo ${shop.name}`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold">{shop.logoFallback?.initials || shop.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">{shop.name}</h1>
                <button
                  onClick={handleToggleFavorite}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Heart className={`h-4 w-4 ${isFavorite(shop.id) ? 'text-white fill-white' : 'text-white/80'}`} />
                </button>
              </div>
              <p className="text-white/80 mt-1 text-sm md:text-base">{shop.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" onClick={() => handleRateShop(value)}>
                      <Star
                        className={`h-4 w-4 ${
                          value <= Math.round(shopRating || shop.rating || 0)
                            ? 'text-yellow-300 fill-yellow-300'
                            : 'text-white/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs text-white/80">
                  {shop.rating ? shop.rating.toFixed(1) : 'Pas encore notée'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge className={`${getCategoryColor(shop.category)} text-xs`}>
                  {getCategoryIcon(shop.category)} {shop.category}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-white/80">
                  <MapPin className="h-3.5 w-3.5" /> {shop.location}, {shop.city}
                </span>
                <span className="flex items-center gap-1 text-sm text-white/80">
                  <Package className="h-3.5 w-3.5" /> {shop.products.length} produits
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md"
              onClick={() => window.open(`https://wa.me/${shop.whatsappNumber.replace(/\s+/g, '').replace('+', '')}`, '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              WhatsApp
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
              <Phone className="h-4 w-4 mr-1.5" />
              Appeler
            </Button>
          </div>
        </div>
      </div>

      {/* Product Search */}
      {shop.products.length > 4 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      )}

      {/* Products - Available */}
      {availableProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Produits disponibles ({availableProducts.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableProducts.map((product) => {
              const qty = getItemQuantity(product.id)
              return (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-md transition-all duration-200 border-0 shadow-sm"
                >
                  <div className={`h-24 bg-gradient-to-br ${getShopColor(product.name)} flex items-center justify-center relative overflow-hidden`}>
                    {product.primaryImage ? (
                      <img src={product.primaryImage} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-white/70">
                        {product.imageFallback?.initials || product.name.charAt(0)}
                      </span>
                    )}
                    <Badge className="absolute top-2 right-2 bg-white/90 text-[10px] text-gray-700 backdrop-blur-sm">
                      {getCategoryIcon(product.category)}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                    <p className="text-orange-600 font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button key={value} type="button" onClick={() => handleRateProduct(product.id, value)}>
                          <Star
                            className={`h-3.5 w-3.5 ${
                              value <= Math.round(product.rating || 0)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {qty > 0 ? (
                      <div className="flex items-center justify-between mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full"
                          onClick={() => {
                            if (qty === 1) {
                              useCartStore.getState().removeItem(product.id)
                              toast.info(`${product.name} retiré du panier`)
                            } else {
                              useCartStore.getState().updateQuantity(product.id, qty - 1)
                            }
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{qty}</span>
                        <Button
                          size="icon"
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-200"
                          onClick={() => handleAddToCart(product)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 h-8 text-xs shadow-sm shadow-orange-200"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingId === product.id}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Products - Unavailable */}
      {unavailableProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            Indisponibles ({unavailableProducts.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {unavailableProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden opacity-60 border-0 shadow-sm"
              >
                <div className="h-24 bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">{product.name.charAt(0)}</span>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm text-gray-500 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-400 font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Indisponible
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {itemCount > 0 && cartShopId === activeShopId && (
        <div className="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6">
          <Button
            onClick={() => router.push('/cart')}
            className="h-14 px-6 rounded-full shadow-2xl shadow-orange-300/50 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 text-base font-semibold"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Panier ({itemCount})
          </Button>
        </div>
      )}
    </div>
  )
}
