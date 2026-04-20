import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Session } from "next-auth"

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

    const lineItems = items as { productId: string; quantity: number }[]

    // Validate line items (shape) then load all products in one query
    for (const item of lineItems) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Chaque article doit avoir un productId et une quantité valide" },
          { status: 400 }
        )
      }
    }
    const productIds: string[] = [
      ...new Set(lineItems.map((line) => line.productId)),
    ]
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    })
    const productById = new Map(products.map((p) => [p.id, p]))

    let total = 0
    const orderItemsData: {
      quantity: number
      price: number
      productName: string
      productId: string
    }[] = []

    for (const item of lineItems) {
      const product = productById.get(item.productId)

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

async function buildOrdersFilter(
  session: Session,
  shopIdParam: string,
  statusParam: string
): Promise<{ ok: true; where: Record<string, unknown> } | { ok: false; response: NextResponse }> {
  const where: Record<string, unknown> = {}
  const user = session.user!

  if (user.role === "ADMIN") {
    if (shopIdParam) {
      where.shopId = shopIdParam
    }
  } else if (user.role === "MARCHAND") {
    const merchantShop = await db.shop.findUnique({
      where: { userId: user.id },
    })

    if (!merchantShop) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Aucune boutique trouvée pour ce marchand" },
          { status: 404 }
        ),
      }
    }

    where.shopId = merchantShop.id
  } else if (user.role === "CLIENT") {
    where.clientId = user.id
  }

  if (statusParam) {
    where.status = statusParam
  }

  return { ok: true, where }
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

    const filter = await buildOrdersFilter(session, shopId, status)
    if (!filter.ok) {
      return filter.response
    }

    const orders = await db.order.findMany({
      where: filter.where,
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
