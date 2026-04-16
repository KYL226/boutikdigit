import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST /api/orders - Create an order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopId, customerName, customerPhone, customerNote, deliveryAddress, items, clientId } = body

    if (!shopId || !customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Boutique, nom du client, téléphone et articles sont requis" },
        { status: 400 }
      )
    }

    // Verify shop exists and is active
    const shop = await db.shop.findUnique({
      where: { id: shopId },
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      )
    }

    if (!shop.isActive) {
      return NextResponse.json(
        { error: "Cette boutique n'est plus active" },
        { status: 400 }
      )
    }

    // Validate products and calculate total
    let total = 0
    const orderItemsData = []

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Chaque article doit avoir un productId et une quantité valide" },
          { status: 400 }
        )
      }

      const product = await db.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Produit avec l'ID ${item.productId} non trouvé` },
          { status: 404 }
        )
      }

      if (!product.isAvailable) {
        return NextResponse.json(
          { error: `Le produit "${product.name}" n'est plus disponible` },
          { status: 400 }
        )
      }

      if (product.shopId !== shopId) {
        return NextResponse.json(
          { error: `Le produit "${product.name}" n'appartient pas à cette boutique` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      total += itemTotal

      orderItemsData.push({
        quantity: item.quantity,
        price: product.price,
        productName: product.name,
        productId: product.id,
      })
    }

    // Get client ID from session if available
    let orderClientId = clientId || null
    const session = await getServerSession(authOptions)
    if (session?.user && session.user.role === "CLIENT") {
      orderClientId = session.user.id
    }

    const order = await db.order.create({
      data: {
        shopId,
        customerName,
        customerPhone,
        customerNote: customerNote || null,
        deliveryAddress: deliveryAddress || null,
        total,
        clientId: orderClientId,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        shop: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    )
  }
}

// GET /api/orders - List orders (filtered by shopId for merchants, all for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get("shopId") || ""
    const status = searchParams.get("status") || ""

    const where: Record<string, unknown> = {}

    if (session.user.role === "ADMIN") {
      // Admin can see all orders
      if (shopId) {
        where.shopId = shopId
      }
    } else if (session.user.role === "MARCHAND") {
      // Merchant sees only their shop's orders
      const shop = await db.shop.findUnique({
        where: { userId: session.user.id },
      })

      if (!shop) {
        return NextResponse.json(
          { error: "Aucune boutique trouvée pour ce marchand" },
          { status: 404 }
        )
      }

      where.shopId = shop.id
    } else if (session.user.role === "CLIENT") {
      // Client sees their own orders
      where.clientId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
        shop: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    )
  }
}
