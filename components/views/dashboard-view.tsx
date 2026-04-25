'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { formatPrice, formatDate, getCategoryIcon, getCategoryColor, getStatusColor, getStatusLabel } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Store,
  Package,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  MessageCircle,
  BarChart3,
} from 'lucide-react'

const CATEGORIES = ['Alimentation', 'Électronique', 'Mode', 'Santé', 'Services']

interface ShopData {
  id: string
  name: string
  description: string
  whatsappNumber: string
  logoUrl?: string | null
  bannerUrl?: string | null
  location: string
  city: string
  category: string
  isActive: boolean
  products: ProductData[]
}

interface ProductData {
  id: string
  name: string
  description: string
  price: number
  image?: string
  images?: { url: string }[]
  isAvailable: boolean
  category: string
}

interface PromoData {
  id: string
  code: string
  description?: string | null
  discountPercent?: number | null
  discountAmount?: number | null
  startsAt?: string | null
  endsAt?: string | null
  usageLimit?: number | null
  usedCount?: number | null
  isActive: boolean
  products?: { productId: string }[]
  createdAt?: string
}

interface OrderData {
  id: string
  status: string
  total: number
  customerName: string
  customerPhone: string
  customerNote?: string
  deliveryAddress?: string
  createdAt: string
  items: { id: string; productName: string; quantity: number; price: number }[]
}

interface DashboardStats {
  total: number
  pending: number
  confirmed: number
  delivered: number
  revenue: number
  productsAvailable: number
  productsTotal: number
}

function MerchantStatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Commandes</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.total}</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-0 bg-gradient-to-br from-yellow-50 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">En attente</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Revenus</span>
          </div>
          <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(stats.revenue)}</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-sky-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Produits</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.productsAvailable}/{stats.productsTotal}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardView() {
  const { setView, setSelectedShopId } = useAppStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const [shop, setShop] = useState<ShopData | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<'overview' | 'products' | 'orders' | 'shop' | 'promos'>('overview')
  const [promos, setPromos] = useState<PromoData[]>([])

  // Shop form
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    whatsappNumber: '',
    logoUrl: '',
    bannerUrl: '',
    location: '',
    city: '',
    category: '',
  })

  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrls: [] as string[],
    category: 'Alimentation',
    isAvailable: true,
  })

  // Promo form
  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discountPercent: '',
    discountAmount: '',
    usageLimit: '',
    startsAt: '',
    endsAt: '',
    scope: 'shop' as 'shop' | 'products',
    productIds: [] as string[],
  })

  const fetchShop = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/shops')
      if (res.ok) {
        const shops = await res.json()
        const myShop = shops.find((s: any) => s.userId === user?.id)
        if (myShop) {
          const detailRes = await fetch(`/api/shops/${myShop.id}`)
          if (detailRes.ok) {
            const data = await detailRes.json()
            setShop(data)
            setShopForm({
              name: data.name,
              description: data.description || '',
              whatsappNumber: data.whatsappNumber,
              logoUrl: data.logoUrl || data.image || '',
              bannerUrl: data.bannerUrl || '',
              location: data.location,
              city: data.city,
              category: data.category,
            })
          }
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const fetchOrders = useCallback(async () => {
    if (!shop) return
    try {
      const res = await fetch(`/api/orders?shopId=${shop.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }, [shop?.id])

  const fetchPromos = useCallback(async () => {
    if (!shop) return
    try {
      const res = await fetch(`/api/promotions?shopId=${shop.id}`)
      if (res.ok) {
        const data = await res.json()
        setPromos(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }, [shop?.id])

  const fileToDataUri = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
      reader.readAsDataURL(file)
    })

  const uploadShopAsset = async (file: File, kind: 'logo' | 'banner') => {
    if (!shop) {
      toast.error('Créez d’abord la boutique avant de téléverser des images')
      return
    }
    setSaving(true)
    try {
      const dataUri = await fileToDataUri(file)
      const res = await fetch('/api/uploads/cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUri, shopId: shop.id, kind }),
      })
      const payload = await res.json()
      if (!res.ok) {
        toast.error(payload.error || 'Échec de l’upload')
        return
      }
      const url = String(payload.url || '')
      if (!url) {
        toast.error("Upload OK mais URL manquante")
        return
      }

      // Mise à jour immédiate en DB pour que ça apparaisse tout de suite côté boutique.
      const updateRes = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'logo' ? { logoUrl: url } : { bannerUrl: url }),
      })
      if (!updateRes.ok) {
        const err = await updateRes.json().catch(() => ({}))
        toast.error(err?.error || "Image uploadée mais sauvegarde boutique échouée")
        // On garde au moins l'aperçu local
        if (kind === 'logo') setShopForm((prev) => ({ ...prev, logoUrl: url }))
        else setShopForm((prev) => ({ ...prev, bannerUrl: url }))
        return
      }

      const updated = await updateRes.json()
      setShop(updated)
      setShopForm((prev) => ({
        ...prev,
        logoUrl: updated.logoUrl || updated.image || prev.logoUrl,
        bannerUrl: updated.bannerUrl || prev.bannerUrl,
      }))

      toast.success(`${kind === 'logo' ? 'Logo' : 'Bannière'} enregistrée`)
    } catch {
      toast.error('Erreur pendant l’upload')
    } finally {
      setSaving(false)
    }
  }

  const uploadProductImages = async (files: FileList | null) => {
    if (!shop || !files?.length) return
    setSaving(true)
    try {
      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const dataUri = await fileToDataUri(file)
        const res = await fetch('/api/uploads/cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUri, shopId: shop.id, kind: 'product' }),
        })
        const payload = await res.json()
        if (!res.ok) {
          toast.error(payload.error || 'Échec upload photo produit')
          continue
        }
        uploadedUrls.push(payload.url)
      }
      if (uploadedUrls.length > 0) {
        setProductForm((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...uploadedUrls],
        }))
        toast.success(`${uploadedUrls.length} image(s) produit uploadée(s)`)
      }
    } catch {
      toast.error('Erreur pendant l’upload des images produit')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'MARCHAND') {
      void fetchShop()
    }
  }, [user?.role, fetchShop])

  useEffect(() => {
    if (shop) {
      void fetchOrders()
    }
  }, [shop, fetchOrders])

  useEffect(() => {
    if (shop) {
      void fetchPromos()
    }
  }, [shop, fetchPromos])

  const deleteShopAsset = async (kind: 'logo' | 'banner') => {
    if (!shop) return
    setSaving(true)
    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'logo' ? { logoUrl: null } : { bannerUrl: null }),
      })
      const payload = await res.json()
      if (!res.ok) {
        toast.error(payload?.error || 'Suppression impossible')
        return
      }
      setShop(payload)
      setShopForm((prev) => ({
        ...prev,
        logoUrl: kind === 'logo' ? '' : prev.logoUrl,
        bannerUrl: kind === 'banner' ? '' : prev.bannerUrl,
      }))
      toast.success(kind === 'logo' ? 'Logo supprimé' : 'Bannière supprimée')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveShop = async () => {
    if (!shop) return
    setSaving(true)
    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopForm),
      })
      if (res.ok) {
        toast.success('Boutique mise à jour')
        await fetchShop()
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateShop = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shopForm,
          userId: user?.id,
        }),
      })
      if (res.ok) {
        toast.success('Boutique créée !')
        await fetchShop()
      } else {
        toast.error('Erreur lors de la création')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!shop) return
    setSaving(true)
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      const body = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        imageUrls: productForm.imageUrls,
        category: productForm.category,
        isAvailable: productForm.isAvailable,
        shopId: shop.id,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingProduct ? 'Produit mis à jour' : 'Produit ajouté')
        setProductDialogOpen(false)
        setEditingProduct(null)
        setProductForm({ name: '', description: '', price: '', imageUrls: [], category: 'Alimentation', isAvailable: true })
        await fetchShop()
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${deleteProductId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Produit supprimé')
        await fetchShop()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
      setDeleteProductId(null)
    }
  }

  const handleToggleAvailability = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Disponibilité mise à jour')
        await fetchShop()
      }
    } catch {
      toast.error('Erreur')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('Statut mis à jour')
        await fetchOrders()
      }
    } catch {
      toast.error('Erreur')
    }
  }

  const openEditProduct = (product: ProductData) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrls: product.images && product.images.length > 0 ? product.images.map((img) => img.url) : product.image ? [product.image] : [],
      category: product.category,
      isAvailable: product.isAvailable,
    })
    setProductDialogOpen(true)
  }

  const openAddProduct = () => {
    setEditingProduct(null)
    setProductForm({ name: '', description: '', price: '', imageUrls: [], category: 'Alimentation', isAvailable: true })
    setProductDialogOpen(true)
  }

  const removeProductImageAt = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }))
  }

  const handleCreatePromo = async () => {
    if (!shop) return
    setSaving(true)
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          code: promoForm.code,
          description: promoForm.description || null,
          discountPercent: promoForm.discountPercent ? Number(promoForm.discountPercent) : null,
          discountAmount: promoForm.discountAmount ? Number(promoForm.discountAmount) : null,
          usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : null,
          startsAt: promoForm.startsAt ? promoForm.startsAt : null,
          endsAt: promoForm.endsAt ? promoForm.endsAt : null,
          productIds: promoForm.scope === 'products' ? promoForm.productIds : [],
        }),
      })
      const payload = await res.json()
      if (!res.ok) {
        toast.error(payload?.error || 'Impossible de créer le code promo')
        return
      }
      toast.success('Code promo créé')
      setPromoForm({
        code: '',
        description: '',
        discountPercent: '',
        discountAmount: '',
        usageLimit: '',
        startsAt: '',
        endsAt: '',
        scope: 'shop',
        productIds: [],
      })
      await fetchPromos()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePromoActive = async (promoId: string, nextIsActive: boolean) => {
    if (!shop) return
    setSaving(true)
    try {
      const res = await fetch('/api/promotions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoId, isActive: nextIsActive }),
      })
      const payload = await res.json()
      if (!res.ok) {
        toast.error(payload?.error || "Impossible de modifier l'état du code promo")
        return
      }
      toast.success(nextIsActive ? 'Code promo activé' : 'Code promo désactivé')
      await fetchPromos()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePromo = async (promoId: string) => {
    if (!shop) return
    if (!confirm('Supprimer ce code promo ?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/promotions?promoId=${encodeURIComponent(promoId)}`, {
        method: 'DELETE',
      })
      const payload = await res.json()
      if (!res.ok) {
        toast.error(payload?.error || 'Impossible de supprimer le code promo')
        return
      }
      toast.success('Code promo supprimé')
      await fetchPromos()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (user?.role !== 'MARCHAND') {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Accès réservé aux marchands</p>
        <Button onClick={() => {
          setView('home')
          router.push('/')
        }} className="mt-4">Retour</Button>
      </div>
    )
  }

  // No shop yet
  if (!shop) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <Store className="h-12 w-12 mx-auto text-orange-500 mb-2" />
            <CardTitle className="text-xl">Créer votre boutique</CardTitle>
            <p className="text-sm text-muted-foreground">
              Commencez par créer votre boutique en ligne
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la boutique *</Label>
              <Input
                placeholder="Ex: Épicerie Al-Baraka"
                value={shopForm.name}
                onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Décrivez votre boutique..."
                value={shopForm.description}
                onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Numéro WhatsApp *</Label>
              <Input
                placeholder="+253 77 00 00 00"
                value={shopForm.whatsappNumber}
                onChange={(e) => setShopForm({ ...shopForm, whatsappNumber: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border flex items-center justify-center overflow-hidden shrink-0">
                  {shopForm.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shopForm.logoUrl} alt="Logo boutique" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-orange-600">{shopForm.name?.charAt(0) || 'B'}</span>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void uploadShopAsset(file, 'logo')
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bannière</Label>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-orange-50 border overflow-hidden">
                  {shopForm.bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shopForm.bannerUrl} alt="Bannière boutique" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void uploadShopAsset(file, 'banner')
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quartier *</Label>
                <Input
                  placeholder="Quartier"
                  value={shopForm.location}
                  onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Ville *</Label>
                <Input
                  placeholder="Ville"
                  value={shopForm.city}
                  onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select
                value={shopForm.category}
                onValueChange={(v) => setShopForm({ ...shopForm, category: v })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateShop}
              disabled={saving || !shopForm.name || !shopForm.whatsappNumber}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Créer ma boutique'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    confirmed: orders.filter((o) => o.status === 'CONFIRMED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    revenue: orders.filter((o) => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total, 0),
    productsAvailable: shop.products.filter((p) => p.isAvailable).length,
    productsTotal: shop.products.length,
  }

  const maxOrderValue = Math.max(stats.pending, stats.confirmed, stats.delivered, 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez votre boutique en ligne</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border bg-white p-3 h-fit lg:sticky lg:top-20">
          <p className="text-xs font-semibold text-muted-foreground px-2 pb-2">Navigation marchand</p>
          <div className="space-y-1">
            <Button
              variant={activeSection === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('overview')}
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Vue d&apos;ensemble
            </Button>
            <Button
              variant={activeSection === 'products' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('products')}
            >
              <Package className="h-4 w-4 mr-2" /> Produits ({shop.products.length})
            </Button>
            <Button
              variant={activeSection === 'orders' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('orders')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Commandes ({orders.length})
            </Button>
            <Button
              variant={activeSection === 'shop' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('shop')}
            >
              <Store className="h-4 w-4 mr-2" /> Boutique
            </Button>
            <Button
              variant={activeSection === 'promos' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('promos')}
            >
              <Zap className="h-4 w-4 mr-2" /> Codes promo
            </Button>
          </div>

        </aside>

        <section className="space-y-4">
        {activeSection === 'overview' ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openAddProduct}
                className="hover:bg-orange-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Produit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedShopId(shop.id)
                  setView('shop')
                  router.push(`/shop/${shop.id}`)
                }}
                className="hover:bg-orange-50"
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir ma boutique
              </Button>
            </div>
            <MerchantStatsCards stats={stats} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
                onClick={openAddProduct}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-xs font-medium">Ajouter produit</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 hover:bg-green-50 hover:border-green-200"
                onClick={() => window.open(`https://wa.me/${shop.whatsappNumber.replace(/\s+/g, '').replace('+', '')}`, '_blank')}
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs font-medium">Ouvrir WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={() => {
                  setSelectedShopId(shop.id)
                  setView('shop')
                  router.push(`/shop/${shop.id}`)
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium">Voir boutique</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200"
                onClick={() => {
                  setSelectedShopId(shop.id)
                  setView('orders')
                  router.push('/orders')
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium">Voir commandes</span>
              </Button>
            </div>
          </>
        ) : null}

        {activeSection === 'products' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Mes produits ({shop.products.length})</h2>
              <Button
                onClick={openAddProduct}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {shop.products.map((product) => (
                <Card key={product.id} className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0">
                        <span className="font-bold text-orange-500">{product.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          <Badge className={`${getCategoryColor(product.category)} text-[10px] px-1.5 py-0`}>
                            {product.category}
                          </Badge>
                        </div>
                        <p className="text-orange-600 font-bold text-sm">{formatPrice(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={product.isAvailable}
                            onCheckedChange={() => handleToggleAvailability(product.id)}
                          />
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {product.isAvailable ? 'Dispo' : 'Indispo'}
                          </span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-orange-50"
                          onClick={() => openEditProduct(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteProductId(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {shop.products.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun produit. Ajoutez votre premier produit !</p>
                <Button onClick={openAddProduct} className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un produit
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {activeSection === 'orders' ? (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucune commande pour le moment</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {orders.map((order) => (
                  <Card key={order.id} className="shadow-sm border-0">
                    <CardContent className="p-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">#{order.id.slice(-6)}</span>
                            <Badge className={`${getStatusColor(order.status)} text-[10px]`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.customerName} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className="font-bold text-orange-600">{formatPrice(order.total)}</span>
                      </div>

                      {expandedOrder === order.id && (
                        <div className="mt-4 pt-3 border-t space-y-3">
                          <div className="text-sm space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.productName} x{item.quantity}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <Separator />
                          <div className="text-sm">
                            <p><span className="text-muted-foreground">Client:</span> {order.customerName}</p>
                            <p><span className="text-muted-foreground">Tél:</span> {order.customerPhone}</p>
                            {order.deliveryAddress && (
                              <p><span className="text-muted-foreground">Adresse:</span> {order.deliveryAddress}</p>
                            )}
                            {order.customerNote && (
                              <p><span className="text-muted-foreground">Note:</span> {order.customerNote}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Changer le statut:</span>
                            <Select
                              value={order.status}
                              onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}
                            >
                              <SelectTrigger className="h-8 w-36 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">En attente</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                                <SelectItem value="DELIVERED">Livrée</SelectItem>
                                <SelectItem value="CANCELLED">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/30"
                            onClick={() => {
                              const phone = shop.whatsappNumber.replace(/\s+/g, '').replace('+', '')
                              const msg = encodeURIComponent(`Bonjour ${order.customerName}, concernant votre commande #${order.id.slice(-6)}...`)
                              window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Contacter via WhatsApp
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeSection === 'shop' ? (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Informations de la boutique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la boutique</Label>
                <Input
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={shopForm.description}
                  onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Numéro WhatsApp</Label>
                <Input
                  value={shopForm.whatsappNumber}
                  onChange={(e) => setShopForm({ ...shopForm, whatsappNumber: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border flex items-center justify-center overflow-hidden shrink-0">
                    {shopForm.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shopForm.logoUrl} alt="Logo boutique" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-orange-600">{shopForm.name?.charAt(0) || 'B'}</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadShopAsset(file, 'logo')
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving || !shopForm.logoUrl}
                    onClick={() => void deleteShopAsset('logo')}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bannière</Label>
                <div className="space-y-2">
                  <div className="h-20 rounded-xl bg-orange-50 border overflow-hidden">
                    {shopForm.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shopForm.bannerUrl} alt="Bannière boutique" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void uploadShopAsset(file, 'banner')
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving || !shopForm.bannerUrl}
                      onClick={() => void deleteShopAsset('banner')}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Quartier</Label>
                  <Input
                    value={shopForm.location}
                    onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={shopForm.city}
                    onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={shopForm.category}
                  onValueChange={(v) => setShopForm({ ...shopForm, category: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSaveShop}
                disabled={saving}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sauvegarder les modifications
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {activeSection === 'promos' ? (
          <div className="space-y-4">
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Créer un code promo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} placeholder="EX: RAMADAN10" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} placeholder="Ex: -10% sur une sélection" className="h-11" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Réduction (%)</Label>
                    <Input type="number" value={promoForm.discountPercent} onChange={(e) => setPromoForm({ ...promoForm, discountPercent: e.target.value, discountAmount: '' })} placeholder="10" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Réduction (montant)</Label>
                    <Input type="number" value={promoForm.discountAmount} onChange={(e) => setPromoForm({ ...promoForm, discountAmount: e.target.value, discountPercent: '' })} placeholder="1000" className="h-11" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Limite d’utilisation</Label>
                    <Input type="number" value={promoForm.usageLimit} onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })} placeholder="Ex: 100" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Début</Label>
                    <Input type="datetime-local" value={promoForm.startsAt} onChange={(e) => setPromoForm({ ...promoForm, startsAt: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fin</Label>
                    <Input type="datetime-local" value={promoForm.endsAt} onChange={(e) => setPromoForm({ ...promoForm, endsAt: e.target.value })} className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Portée</Label>
                  <Select value={promoForm.scope} onValueChange={(v: any) => setPromoForm({ ...promoForm, scope: v, productIds: [] })}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shop">Toute la boutique</SelectItem>
                      <SelectItem value="products">Produits sélectionnés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {promoForm.scope === 'products' ? (
                  <div className="space-y-2">
                    <Label>Produits concernés</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {shop.products.map((p) => {
                        const checked = promoForm.productIds.includes(p.id)
                        return (
                          <label key={p.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...promoForm.productIds, p.id]
                                  : promoForm.productIds.filter((id) => id !== p.id)
                                setPromoForm({ ...promoForm, productIds: next })
                              }}
                            />
                            <span className="truncate">{p.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                <Button onClick={handleCreatePromo} disabled={saving || !promoForm.code || (!promoForm.discountPercent && !promoForm.discountAmount)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Créer
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Mes codes promo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {promos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun code promo pour le moment.</p>
                ) : (
                  promos.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{p.code}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.discountPercent ? `-${p.discountPercent}%` : p.discountAmount ? `-${p.discountAmount}` : ''}{' '}
                          {p.products && p.products.length > 0 ? `• ${p.products.length} produit(s)` : '• Boutique'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {p.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() => void handleTogglePromoActive(p.id, !p.isActive)}
                        >
                          {p.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          className="text-red-500 hover:text-red-600"
                          onClick={() => void handleDeletePromo(p.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
        </section>
      </div>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nom du produit *</Label>
              <Input
                placeholder="Ex: Riz Basmati 5kg"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Décrivez le produit..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix (FCFA) *</Label>
              <Input
                type="number"
                placeholder="4500"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Photos du produit</Label>
              {productForm.imageUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {productForm.imageUrls.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="relative h-20 rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo produit ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeProductImageAt(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-2 py-0.5"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Aucune photo. Téléversez des images ci-dessous.</p>
              )}
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  void uploadProductImages(e.target.files)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={productForm.category}
                onValueChange={(v) => setProductForm({ ...productForm, category: v })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={productForm.isAvailable}
                onCheckedChange={(v) => setProductForm({ ...productForm, isAvailable: v })}
              />
              <Label>Produit disponible</Label>
            </div>
            <Button
              onClick={handleSaveProduct}
              disabled={saving || !productForm.name || !productForm.price}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 h-11"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editingProduct ? 'Sauvegarder' : 'Ajouter le produit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
