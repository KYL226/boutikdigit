import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/shops/[id] - Get shop by ID with products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const shop = await db.shop.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
          },
        },
        products: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error("Erreur lors de la récupération de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la boutique" },
      { status: 500 }
    )
  }
}

// PUT /api/shops/[id] - Update shop (owner only)
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

    const shop = await db.shop.findUnique({
      where: { id },
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      )
    }

    if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette boutique" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, whatsappNumber, image, location, city, category } = body

    const updatedShop = await db.shop.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(whatsappNumber !== undefined && { whatsappNumber }),
        ...(image !== undefined && { image }),
        ...(location !== undefined && { location }),
        ...(city !== undefined && { city }),
        ...(category !== undefined && { category }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la boutique" },
      { status: 500 }
    )
  }
}

// DELETE /api/shops/[id] - Delete shop (owner or ADMIN)
export async function DELETE(
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

    const shop = await db.shop.findUnique({
      where: { id },
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      )
    }

    if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cette boutique" },
        { status: 403 }
      )
    }

    await db.shop.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Boutique supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la boutique" },
      { status: 500 }
    )
  }
}
