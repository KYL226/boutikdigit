import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/shops - List all active shops with optional search and category filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { location: { contains: q } },
        { city: { contains: q } },
        { description: { contains: q } },
      ]
    }

    if (category) {
      where.category = category
    }

    const shops = await db.shop.findMany({
      where,
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
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(shops)
  } catch (error) {
    console.error("Erreur lors de la récupération des boutiques:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des boutiques" },
      { status: 500 }
    )
  }
}

// POST /api/shops - Create a new shop (MARCHAND only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    if (session.user.role !== "MARCHAND" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les marchands peuvent créer une boutique" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, whatsappNumber, image, location, city, category } = body

    if (!name || !whatsappNumber || !location || !city) {
      return NextResponse.json(
        { error: "Nom, numéro WhatsApp, localisation et ville sont requis" },
        { status: 400 }
      )
    }

    // Check if user already has a shop
    const existingShop = await db.shop.findUnique({
      where: { userId: session.user.id },
    })

    if (existingShop) {
      return NextResponse.json(
        { error: "Vous avez déjà une boutique" },
        { status: 409 }
      )
    }

    const shop = await db.shop.create({
      data: {
        name,
        description: description || "",
        whatsappNumber,
        image: image || null,
        location,
        city,
        category: category || "General",
        userId: session.user.id,
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

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la boutique" },
      { status: 500 }
    )
  }
}
