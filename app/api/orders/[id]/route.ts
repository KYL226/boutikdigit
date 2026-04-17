import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/orders/[id] - Get order by ID with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        shop: {
          select: {
            id: true,
            name: true,
            city: true,
            location: true,
            whatsappNumber: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
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
    })

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      )
    }

    // Check access: admin, shop owner, or order client
    const isShopOwner = order.shop.user.id === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    const isClient = order.clientId === session.user.id

    if (!isShopOwner && !isAdmin && !isClient) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir cette commande" },
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la commande" },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order status (shop owner or ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        shop: {
          include: {
            user: {
              select: { id: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      )
    }

    const isShopOwner = order.shop.user.id === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isShopOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette commande" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    const validStatuses = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Statuts acceptés : ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        shop: {
          select: {
            id: true,
            name: true,
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
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    )
  }
}
