import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { buildInitialsAvatar } from "@/lib/media"

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        images: true,
        reviews: {
          select: { rating: true },
        },
        shop: {
          select: {
            id: true,
            name: true,
            city: true,
            location: true,
            whatsappNumber: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      )
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : null
    return NextResponse.json({
      ...product,
      primaryImage: product.images[0]?.url || product.image || null,
      imageFallback: !product.images[0]?.url && !product.image ? buildInitialsAvatar(product.name) : null,
      rating: avgRating,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (shop owner only)
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

    const product = await db.product.findUnique({
      where: { id },
      include: { shop: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      )
    }

    if (product.shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce produit" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, price, image, imageUrls, isAvailable, category } = body

    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: "Le prix doit être supérieur à 0" },
        { status: 400 }
      )
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(image !== undefined && { image }),
        ...(imageUrls !== undefined && {
          images: {
            deleteMany: {},
            create: Array.isArray(imageUrls)
              ? imageUrls
                  .filter((url: unknown) => typeof url === "string" && url.trim().length > 0)
                  .map((url: string) => ({ url }))
              : [],
          },
        }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(category !== undefined && { category }),
      },
      include: {
        images: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit" },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product (shop owner or ADMIN)
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

    const product = await db.product.findUnique({
      where: { id },
      include: { shop: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      )
    }

    if (product.shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce produit" },
        { status: 403 }
      )
    }

    await db.product.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Produit supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - Toggle availability (shop owner only)
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

    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: { shop: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      )
    }

    if (product.shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce produit" },
        { status: 403 }
      )
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        isAvailable: !product.isAvailable,
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

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Erreur lors du changement de disponibilité:", error)
    return NextResponse.json(
      { error: "Erreur lors du changement de disponibilité" },
      { status: 500 }
    )
  }
}
