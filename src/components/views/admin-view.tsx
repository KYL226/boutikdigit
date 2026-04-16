'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { formatPrice, formatDate, getCategoryIcon, getCategoryColor, getStatusColor, getStatusLabel } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  Shield,
  ToggleLeft,
  ToggleRight,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  DollarSign,
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalShops: number
  activeShops: number
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  merchantCount: number
  clientCount: number
  totalRevenue: number
  categoryDistribution: { category: string; _count: { category: number } }[]
  ordersByStatus: { PENDING: number; CONFIRMED: number; DELIVERED: number; CANCELLED: number }
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  createdAt: string
  shop?: { id: string; name: string }
}

interface ShopData {
  id: string
  name: string
  category: string
  isActive: boolean
  city: string
  location: string
  user: { name: string; email: string }
  _count: { products: number; orders: number }
}

export default function AdminView() {
  const { setView, setSelectedShopId } = useAppStore()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [shops, setShops] = useState<ShopData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin?type=stats')
      if (res.ok) setStats(await res.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin?type=users')
      if (res.ok) setUsers(await res.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/admin?type=shops')
      if (res.ok) setShops(await res.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const loadData = async () => {
        await Promise.all([fetchStats(), fetchUsers(), fetchShops()])
        setLoading(false)
      }
      loadData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [user?.role])

  const handleToggleShop = async (shopId: string) => {
    try {
      const res = await fetch(`/api/admin/shops/${shopId}`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Statut mis à jour')
        fetchShops()
        fetchStats()
      }
    } catch {
      toast.error('Erreur')
    }
  }

  const handleViewShop = (shopId: string) => {
    setSelectedShopId(shopId)
    setView('shop')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-16">
        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-muted-foreground">Accès réservé aux administrateurs</p>
        <Button onClick={() => setView('home')} className="mt-4">Retour</Button>
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800',
      MARCHAND: 'bg-orange-100 text-orange-800',
      CLIENT: 'bg-green-100 text-green-800',
    }
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      MARCHAND: 'Marchand',
      CLIENT: 'Client',
    }
    return { style: styles[role] || 'bg-gray-100 text-gray-800', label: labels[role] || role }
  }

  const maxOrderStatus = stats ? Math.max(...Object.values(stats.ordersByStatus), 1) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestion de la plateforme BoutikDigit</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Administrateur
        </Badge>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Utilisateurs</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-1">{stats?.totalUsers || 0}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats?.merchantCount || 0} marchands • {stats?.clientCount || 0} clients
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Boutiques</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.totalShops || 0}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats?.activeShops || 0} actives
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Produits</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.totalProducts || 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-rose-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-rose-500" />
              <span className="text-xs text-muted-foreground">Revenus</span>
            </div>
            <p className="text-lg font-bold text-rose-600 mt-1">{formatPrice(stats?.totalRevenue || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Stats + Category Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orders by Status */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              Commandes par statut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats && [
              { label: 'En attente', value: stats.ordersByStatus.PENDING, color: 'bg-yellow-400', textColor: 'text-yellow-700' },
              { label: 'Confirmées', value: stats.ordersByStatus.CONFIRMED, color: 'bg-blue-400', textColor: 'text-blue-700' },
              { label: 'Livrées', value: stats.ordersByStatus.DELIVERED, color: 'bg-green-400', textColor: 'text-green-700' },
              { label: 'Annulées', value: stats.ordersByStatus.CANCELLED, color: 'bg-red-400', textColor: 'text-red-700' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={item.textColor}>{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.value / maxOrderStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span className="text-orange-600">{stats?.totalOrders || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Store className="h-4 w-4 text-emerald-500" />
              Boutiques par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.categoryDistribution.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`${getCategoryColor(cat.category)} text-xs`}>
                    {getCategoryIcon(cat.category)} {cat.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                      style={{ width: `${(cat._count.category / (stats?.totalShops || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-6 text-right">{cat._count.category}</span>
                </div>
              </div>
            ))}
            {(!stats?.categoryDistribution || stats.categoryDistribution.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-sm border-0 bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">En attente</p>
              <p className="text-lg font-bold text-yellow-600">{stats?.pendingOrders || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Livrées</p>
              <p className="text-lg font-bold text-green-600">{stats?.deliveredOrders || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Annulées</p>
              <p className="text-lg font-bold text-red-600">{stats?.cancelledOrders || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="users" className="gap-1">
            <Users className="h-4 w-4" /> Utilisateurs ({users.length})
          </TabsTrigger>
          <TabsTrigger value="shops" className="gap-1">
            <Store className="h-4 w-4" /> Boutiques ({shops.length})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {users.map((u) => {
              const roleBadge = getRoleBadge(u.role)
              return (
                <Card key={u.id} className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center shrink-0">
                          <span className="font-semibold text-orange-700 text-sm">{u.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          {u.shop && (
                            <p className="text-xs text-orange-600 mt-0.5">🏪 {u.shop.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${roleBadge.style} text-[10px]`}>{roleBadge.label}</Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Shops Tab */}
        <TabsContent value="shops">
          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {shops.map((s) => (
              <Card key={s.id} className={`shadow-sm border-0 ${!s.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0">
                        <span className="font-bold text-orange-500 text-sm">{s.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{s.name}</p>
                          <Badge className={`${getCategoryColor(s.category)} text-[10px]`}>
                            {getCategoryIcon(s.category)} {s.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Par {s.user.name} • {s._count.products} produits • {s._count.orders} commandes
                        </p>
                        <p className="text-xs text-muted-foreground">
                          📍 {s.location}, {s.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-[10px]`}>
                        {s.isActive ? 'Active' : 'Désactivée'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewShop(s.id)}
                        className="h-8 text-xs"
                      >
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleShop(s.id)}
                        className="h-8 text-xs"
                      >
                        {s.isActive ? (
                          <>
                            <ToggleRight className="h-3.5 w-3.5 mr-1" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-3.5 w-3.5 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
