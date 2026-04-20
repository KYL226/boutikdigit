import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/admin - Platform stats or user/shop lists
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || ""

    if (type === "users") {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json(users)
    }

    if (type === "shops") {
      const shops = await db.shop.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: { products: true, orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json(shops)
    }

    if (type === "orders") {
      const orders = await db.order.findMany({
        include: {
          items: true,
          shop: {
            select: { name: true },
          },
          client: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
      return NextResponse.json(orders)
    }

    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        shop: {
          select: { name: true },
        },
        items: true,
      },
    })

    // Default: return platform stats
    const [
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      activeShops,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      merchantCount,
      clientCount,
    ] = await Promise.all([
      db.user.count(),
      db.shop.count(),
      db.product.count(),
      db.order.count(),
      db.shop.count({ where: { isActive: true } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count({ where: { status: "CONFIRMED" } }),
      db.order.count({ where: { status: "DELIVERED" } }),
      db.order.count({ where: { status: "CANCELLED" } }),
      db.user.count({ where: { role: "MARCHAND" } }),
      db.user.count({ where: { role: "CLIENT" } }),
    ])

    const totalRevenue = await db.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["CONFIRMED", "DELIVERED"] } },
    })

    // Category distribution
    const categoryDistribution = await db.shop.groupBy({
      by: ["category"],
      _count: { category: true },
    })

    // Orders by status for chart
    const ordersByStatus = {
      PENDING: pendingOrders,
      CONFIRMED: confirmedOrders,
      DELIVERED: deliveredOrders,
      CANCELLED: cancelledOrders,
    }

    return NextResponse.json({
      totalUsers,
      totalShops,
      activeShops,
      totalProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      merchantCount,
      clientCount,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
      categoryDistribution,
      ordersByStatus,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  }
}
