'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { useCartStore, type CartItem } from '@/store/cart-store'
import { formatPrice, generateWhatsAppLink } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  ShoppingCart,
  Send,
  Loader2,
} from 'lucide-react'

export default function CartView() {
  const { setView, setSelectedShopId } = useAppStore()
  const router = useRouter()
  const { items, shopId, shopName, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerNote: '',
    deliveryAddress: '',
  })

  const total = getTotal()

  const handleWhatsAppOrder = async () => {
    if (!shopId) return
    const cartItems = items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }))
    try {
      const res = await fetch(`/api/shops/${shopId}`)
      if (!res.ok) {
        toast.error('Erreur lors de la récupération de la boutique')
        return
      }
      const shop = await res.json()
      const link = generateWhatsAppLink(shop.whatsappNumber, cartItems, shopName || shop.name)
      window.open(link, '_blank')
      toast.success('Redirection vers WhatsApp...')
    } catch {
      toast.error('Erreur lors de la génération du lien WhatsApp')
    }
  }

  const handlePlatformOrder = async () => {
    if (!formData.customerName || !formData.customerPhone) {
      toast.error('Veuillez remplir votre nom et numéro de téléphone')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerNote: formData.customerNote || undefined,
          deliveryAddress: formData.deliveryAddress || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      if (res.ok) {
        toast.success('Commande envoyée avec succès !')
        clearCart()
        setOrderDialogOpen(false)
        setView('home')
        router.push('/')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la commande')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-orange-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Votre panier est vide</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Parcourez les boutiques et ajoutez des produits
        </p>
        <Button
          onClick={() => {
            setView('home')
            router.push('/')
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Voir les boutiques
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (shopId) {
              setSelectedShopId(shopId)
              setView('shop')
              router.push(`/shop/${shopId}`)
            } else {
              setView('home')
              router.push('/')
            }
          }}
          className="hover:bg-orange-50 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Continuer mes achats
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearCart()
            toast.info('Panier vidé')
          }}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Vider
        </Button>
      </div>

      {/* Shop Name */}
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-orange-500" />
        <h1 className="text-xl font-bold">{shopName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.productId} className="shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-orange-500">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <p className="text-orange-600 font-bold text-sm">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeItem(item.productId)
                          toast.info(`${item.name} retiré du panier`)
                        } else {
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => {
                      removeItem(item.productId)
                      toast.info(`${item.name} retiré du panier`)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="shadow-md border-0 sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-orange-600">{formatPrice(total)}</span>
              </div>

              {/* WhatsApp Order Button */}
              <Button
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12 text-base font-semibold"
                onClick={handleWhatsAppOrder}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Commander via WhatsApp
              </Button>

              {/* Platform Order Button */}
              <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-semibold border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Commander sur la plateforme
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Passer votre commande</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        placeholder="Votre nom"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({ ...formData, customerName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        placeholder="+253 77 00 00 00"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, customerPhone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse de livraison</Label>
                      <Input
                        id="address"
                        placeholder="Quartier, rue, repère..."
                        value={formData.deliveryAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, deliveryAddress: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Note (optionnel)</Label>
                      <Textarea
                        id="note"
                        placeholder="Instructions spéciales..."
                        value={formData.customerNote}
                        onChange={(e) =>
                          setFormData({ ...formData, customerNote: e.target.value })
                        }
                      />
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span className="text-orange-600">{formatPrice(total)}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 h-12"
                      onClick={handlePlatformOrder}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Confirmer la commande
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
