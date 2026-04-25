import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { uploadBase64ToCloudinary } from "@/lib/cloudinary"

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
    const { dataUri, shopId, kind } = body as {
      dataUri?: string
      shopId?: string
      kind?: "logo" | "banner" | "product"
    }

    if (!dataUri || !shopId || !kind) {
      return NextResponse.json({ error: "dataUri, shopId et kind sont requis" }, { status: 400 })
    }

    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 })
    }

    if (session.user.role !== "ADMIN" && shop.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé pour cette boutique" }, { status: 403 })
    }

    const url = await uploadBase64ToCloudinary(dataUri, { shopName: shop.name, kind })
    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error("Upload Cloudinary error:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload d'image" }, { status: 500 })
  }
}
