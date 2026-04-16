import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/products - List products with optional shopId filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get("shopId") || ""
    const category = searchParams.get("category") || ""
    const available = searchParams.get("available")

    const where: Record<string, unknown> = {}

    if (shopId) {
      where.shopId = shopId
    }

    if (category) {
      where.category = category
    }

    if (available !== null && available !== "") {
      where.isAvailable = available === "true"
    }

    const products = await db.product.findMany({
      where,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            city: true,
            location: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a product (MARCHAND only)
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
        { error: "Seuls les marchands peuvent ajouter des produits" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, price, image, isAvailable, category, shopId } = body

    if (!name || price === undefined || !shopId) {
      return NextResponse.json(
        { error: "Nom, prix et boutique sont requis" },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Le prix doit être supérieur à 0" },
        { status: 400 }
      )
    }

    // Verify shop belongs to user (or user is ADMIN)
    const shop = await db.shop.findUnique({
      where: { id: shopId },
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      )
    }

    if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas le propriétaire de cette boutique" },
        { status: 403 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || "",
        price: Number(price),
        image: image || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        category: category || "General",
        shopId,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    )
  }
}
