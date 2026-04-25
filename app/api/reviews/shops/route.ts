import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get("shopId") || ""
    if (!shopId) {
      return NextResponse.json({ error: "shopId est requis" }, { status: 400 })
    }

    const reviews = await db.shopReview.findMany({
      where: { shopId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const average =
      reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : null

    return NextResponse.json({ reviews, average, count: reviews.length })
  } catch (error) {
    console.error("Shop reviews GET error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des avis" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    const body = await request.json()
    const { shopId, rating, comment } = body
    if (!shopId || !rating) {
      return NextResponse.json({ error: "shopId et rating sont requis" }, { status: 400 })
    }

    const normalizedRating = Number(rating)
    if (normalizedRating < 1 || normalizedRating > 5) {
      return NextResponse.json({ error: "La note doit être entre 1 et 5" }, { status: 400 })
    }

    const review = await db.shopReview.upsert({
      where: { shopId_userId: { shopId, userId: session.user.id } },
      update: { rating: normalizedRating, comment: comment || null },
      create: { shopId, userId: session.user.id, rating: normalizedRating, comment: comment || null },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Shop reviews POST error:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'avis" }, { status: 500 })
  }
}
