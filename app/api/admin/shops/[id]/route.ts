import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// PATCH /api/admin/shops/[id] - Toggle shop active/inactive status (ADMIN only)
export async function PATCH(
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
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

    const updatedShop = await db.shop.update({
      where: { id },
      data: {
        isActive: !shop.isActive,
      },
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
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error("Erreur lors du changement de statut de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur lors du changement de statut de la boutique" },
      { status: 500 }
    )
  }
}
