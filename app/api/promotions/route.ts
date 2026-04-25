import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get("shopId") || ""
    const code = searchParams.get("code") || ""
    const now = new Date()

    const where: Record<string, unknown> = {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    }
    if (shopId) where.shopId = shopId
    if (code) where.code = code.toUpperCase()

    const promos = await db.promoCode.findMany({
      where,
      include: {
        products: {
          select: { productId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(promos)
  } catch (error) {
    console.error("Promotions GET error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des promotions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    if (session.user.role !== "MARCHAND" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const {
      shopId,
      code,
      description,
      discountPercent,
      discountAmount,
      startsAt,
      endsAt,
      usageLimit,
      productIds,
    } = body

    if (!shopId || !code) {
      return NextResponse.json({ error: "shopId et code sont requis" }, { status: 400 })
    }

    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 })
    if (session.user.role !== "ADMIN" && shop.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé pour cette boutique" }, { status: 403 })
    }

    if (!discountPercent && !discountAmount) {
      return NextResponse.json({ error: "Une réduction en % ou montant est requise" }, { status: 400 })
    }

    const normalizedProductIds: string[] = Array.isArray(productIds)
      ? productIds.filter((id: unknown) => typeof id === "string" && id.trim().length > 0)
      : []

    if (normalizedProductIds.length > 0) {
      const products = await db.product.findMany({
        where: { id: { in: normalizedProductIds } },
        select: { id: true, shopId: true },
      })
      const byId = new Map(products.map((p) => [p.id, p]))

      for (const pid of normalizedProductIds) {
        const p = byId.get(pid)
        if (!p) {
          return NextResponse.json({ error: "Produit introuvable dans la sélection" }, { status: 400 })
        }
        if (p.shopId !== shopId) {
          return NextResponse.json({ error: "Tous les produits doivent appartenir à la même boutique" }, { status: 400 })
        }
      }
    }

    const promo = await db.promoCode.create({
      data: {
        shopId,
        code: String(code).toUpperCase(),
        description: description || null,
        discountPercent: discountPercent ? Number(discountPercent) : null,
        discountAmount: discountAmount ? Number(discountAmount) : null,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        products:
          normalizedProductIds.length > 0
            ? {
                create: normalizedProductIds.map((productId: string) => ({
                  productId,
                })),
              }
            : undefined,
      },
    })

    return NextResponse.json(promo, { status: 201 })
  } catch (error) {
    console.error("Promotions POST error:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la promotion" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    if (session.user.role !== "MARCHAND" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { promoId, isActive } = body as { promoId?: string; isActive?: boolean }

    if (!promoId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "promoId et isActive sont requis" }, { status: 400 })
    }

    const promo = await db.promoCode.findUnique({ where: { id: promoId } })
    if (!promo) return NextResponse.json({ error: "Code promo introuvable" }, { status: 404 })

    if (session.user.role !== "ADMIN") {
      const shop = await db.shop.findUnique({ where: { id: promo.shopId } })
      if (!shop || shop.userId !== session.user.id) {
        return NextResponse.json({ error: "Accès refusé pour cette boutique" }, { status: 403 })
      }
    }

    const updated = await db.promoCode.update({
      where: { id: promoId },
      data: { isActive },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Promotions PATCH error:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du code promo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    if (session.user.role !== "MARCHAND" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const promoId = searchParams.get("promoId") || ""
    if (!promoId) {
      return NextResponse.json({ error: "promoId est requis" }, { status: 400 })
    }

    const promo = await db.promoCode.findUnique({ where: { id: promoId } })
    if (!promo) return NextResponse.json({ error: "Code promo introuvable" }, { status: 404 })

    if (session.user.role !== "ADMIN") {
      const shop = await db.shop.findUnique({ where: { id: promo.shopId } })
      if (!shop || shop.userId !== session.user.id) {
        return NextResponse.json({ error: "Accès refusé pour cette boutique" }, { status: 403 })
      }
    }

    await db.promoCode.delete({ where: { id: promoId } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Promotions DELETE error:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du code promo" }, { status: 500 })
  }
}
