import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DEFAULT_BANNER_DATA_URI, buildInitialsAvatar } from "@/lib/media"

/** Corps attendu pour PUT /api/shops/[id] — typé pour Prisma (évite unknown / Record) */
type ShopUpdateBody = {
  name?: string
  description?: string
  whatsappNumber?: string
  image?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  location?: string
  city?: string
  category?: string
}

function getShopUpdateData(body: ShopUpdateBody): Prisma.ShopUpdateInput {
  const data: Prisma.ShopUpdateInput = {}
  if (body.name !== undefined) data.name = body.name
  if (body.description !== undefined) data.description = body.description
  if (body.whatsappNumber !== undefined) data.whatsappNumber = body.whatsappNumber
  if (body.image !== undefined) data.image = body.image
  if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl
  if (body.bannerUrl !== undefined) data.bannerUrl = body.bannerUrl
  if (body.location !== undefined) data.location = body.location
  if (body.city !== undefined) data.city = body.city
  if (body.category !== undefined) data.category = body.category
  return data
}

async function getAuthorizedShop(id: string, userId: string, role: string) {
  const shop = await db.shop.findUnique({ where: { id } })
  if (!shop) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 }),
    }
  }
  if (shop.userId !== userId && role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette boutique" },
        { status: 403 }
      ),
    }
  }
  return { ok: true as const, shop }
}

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
          include: {
            images: true,
            reviews: {
              select: { rating: true },
            },
          },
        },
        _count: {
          select: { orders: true, reviews: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      )
    }

    const averageShopRating =
      shop.reviews.length > 0
        ? shop.reviews.reduce((acc, r) => acc + r.rating, 0) / shop.reviews.length
        : null

    return NextResponse.json({
      ...shop,
      logoUrl: shop.logoUrl || shop.image || null,
      bannerUrl: shop.bannerUrl || DEFAULT_BANNER_DATA_URI,
      logoFallback: !shop.logoUrl && !shop.image ? buildInitialsAvatar(shop.name) : null,
      rating: averageShopRating,
      products: shop.products.map((product) => {
        const productAverage =
          product.reviews.length > 0
            ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
            : null
        return {
          ...product,
          images: product.images,
          primaryImage: product.images[0]?.url || product.image || null,
          imageFallback: !product.images[0]?.url && !product.image ? buildInitialsAvatar(product.name) : null,
          rating: productAverage,
        }
      }),
    })
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

    const authorization = await getAuthorizedShop(id, session.user.id, session.user.role)
    if (!authorization.ok) {
      return authorization.response
    }

    const body = (await request.json()) as ShopUpdateBody

    const updatedShop = await db.shop.update({
      where: { id },
      data: getShopUpdateData(body),
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
