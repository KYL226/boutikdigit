import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, phone, whatsapp, shopName, shopDescription, shopWhatsappNumber, shopLocation, shopCity, shopCategory } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe sont requis" },
        { status: 400 }
      )
    }

    const validRoles = ["CLIENT", "MARCHAND"]
    const userRole = role || "CLIENT"
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "Rôle invalide. Rôles acceptés : CLIENT, MARCHAND" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      )
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        phone: phone || null,
        whatsapp: whatsapp || null,
      },
    })

    // If MARCHAND and shop data provided, auto-create shop
    if (userRole === "MARCHAND" && shopName) {
      await db.shop.create({
        data: {
          name: shopName,
          description: shopDescription || "",
          whatsappNumber: shopWhatsappNumber || whatsapp || phone || "",
          location: shopLocation || "",
          city: shopCity || "",
          category: shopCategory || "General",
          userId: user.id,
        },
      })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(
      { message: "Compte créé avec succès", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    )
  }
}
