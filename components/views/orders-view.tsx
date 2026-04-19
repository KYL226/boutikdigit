'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react'

interface OrderData {
  id: string
  status: string
  total: number
  customerName: string
  customerPhone: string
  customerNote?: string
  deliveryAddress?: string
  createdAt: string
  shop: { name: string }
  items: { id: string; productName: string; quantity: number; price: number }[]
}

interface OrdersListProps {
  orders: OrderData[]
  expandedOrder: string | null
  onToggleOrder: (id: string) => void
}

function OrdersList({ orders, expandedOrder, onToggleOrder }: OrdersListProps) {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="shadow-sm border-0">
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => onToggleOrder(order.id)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">#{order.id.slice(-6)}</span>
                  <Badge className={`${getStatusColor(order.status)} text-[10px]`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.shop.name} • {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-600">{formatPrice(order.total)}</span>
                {expandedOrder === order.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
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
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Boutique:</span> {order.shop.name}</p>
                  {order.deliveryAddress && (
                    <p><span className="text-muted-foreground">Adresse:</span> {order.deliveryAddress}</p>
                  )}
                  {order.customerNote && (
                    <p><span className="text-muted-foreground">Note:</span> {order.customerNote}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function OrdersView() {
  const { setView } = useAppStore()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
    
      setLoading(false)
      return
    }
    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        setOrders(data)
      } catch (err) {
        console.error(err)
      } finally {
        
        setLoading(false)
      }
    }
    loadOrders()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-muted-foreground mb-4">Connectez-vous pour voir vos commandes</p>
        <Button onClick={() => {
          setView('login')
          router.push('/login')
        }} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          Se connecter
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore de commandes</p>
          <Button
            onClick={() => {
              setView('home')
              router.push('/')
            }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
          >
            Parcourir les boutiques
          </Button>
        </div>
      ) : (
        <OrdersList
          orders={orders}
          expandedOrder={expandedOrder}
          onToggleOrder={(id) => setExpandedOrder(expandedOrder === id ? null : id)}
        />
      )}
    </div>
  )
}
