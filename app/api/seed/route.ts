import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

// GET /api/seed - Seed the database with sample data
export async function GET() {
  try {
    // Clear existing data in correct order (respecting foreign keys)
    await db.orderItem.deleteMany()
    await db.order.deleteMany()
    await db.product.deleteMany()
    await db.shop.deleteMany()
    await db.user.deleteMany()

    // Hash passwords
    const adminPassword = await hash("admin123", 12)
    const merchantPassword = await hash("marchand123", 12)
    const clientPassword = await hash("client123", 12)

    // Create admin user
    const admin = await db.user.create({
      data: {
        name: "Administrateur",
        email: "admin@boutique.dj",
        password: adminPassword,
        role: "ADMIN",
        phone: "+253 77 00 00 00",
      },
    })

    // Create merchant 1 - Alimentation
    const merchant1 = await db.user.create({
      data: {
        name: "Ahmed Omar",
        email: "ahmed@boutique.dj",
        password: merchantPassword,
        role: "MARCHAND",
        phone: "+253 77 12 34 56",
        whatsapp: "+253 77 12 34 56",
      },
    })

    const shop1 = await db.shop.create({
      data: {
        name: "Épicerie Al-Baraka",
        description: "Votre épicerie de quartier avec les meilleurs produits alimentaires frais et importés. Livraison rapide à Djibouti-ville.",
        whatsappNumber: "+25377123456",
        location: "Quartier 1",
        city: "Djibouti",
        category: "Alimentation",
        userId: merchant1.id,
      },
    })

    // Create merchant 2 - Électronique
    const merchant2 = await db.user.create({
      data: {
        name: "Fatima Hassan",
        email: "fatima@boutique.dj",
        password: merchantPassword,
        role: "MARCHAND",
        phone: "+253 77 98 76 54",
        whatsapp: "+253 77 98 76 54",
      },
    })

    const shop2 = await db.shop.create({
      data: {
        name: "TechDjib Shop",
        description: "Matériel électronique, téléphones et accessoires au meilleur prix. Réparation et vente.",
        whatsappNumber: "+25377987654",
        location: "Quartier 6",
        city: "Djibouti",
        category: "Électronique",
        userId: merchant2.id,
      },
    })

    // Create merchant 3 - Mode
    const merchant3 = await db.user.create({
      data: {
        name: "Amina Robleh",
        email: "amina@boutique.dj",
        password: merchantPassword,
        role: "MARCHAND",
        phone: "+253 77 33 22 11",
        whatsapp: "+253 77 33 22 11",
      },
    })

    const shop3 = await db.shop.create({
      data: {
        name: "Boutique Al-Amal",
        description: "Vêtements traditionnels et modernes pour toute la famille. Tenues djiboutiennes, wax africain et mode contemporaine.",
        whatsappNumber: "+25377332211",
        location: "Quartier 2",
        city: "Djibouti",
        category: "Mode",
        userId: merchant3.id,
      },
    })

    // Create merchant 4 - Santé
    const merchant4 = await db.user.create({
      data: {
        name: "Dr. Ismaël Omar",
        email: "ismael@boutique.dj",
        password: merchantPassword,
        role: "MARCHAND",
        phone: "+253 77 44 55 66",
        whatsapp: "+253 77 44 55 66",
      },
    })

    const shop4 = await db.shop.create({
      data: {
        name: "Pharmacie du Quartier",
        description: "Produits pharmaceutiques et de santé au meilleur prix. Conseils personnalisés et médicaments essentiels disponibles.",
        whatsappNumber: "+25377445566",
        location: "Quartier 4",
        city: "Djibouti",
        category: "Santé",
        userId: merchant4.id,
      },
    })

    // Create merchant 5 - Services
    const merchant5 = await db.user.create({
      data: {
        name: "Youssef Ali",
        email: "youssef@boutique.dj",
        password: merchantPassword,
        role: "MARCHAND",
        phone: "+253 77 55 66 77",
        whatsapp: "+253 77 55 66 77",
      },
    })

    const shop5 = await db.shop.create({
      data: {
        name: "Services Express",
        description: "Services à domicile et assistance rapide. Cours, réparations, livraison et bien plus encore.",
        whatsappNumber: "+25377556677",
        location: "Quartier 3",
        city: "Djibouti",
        category: "Services",
        userId: merchant5.id,
      },
    })

    // Create a client user
    const client = await db.user.create({
      data: {
        name: "Mohamed Ali",
        email: "mohamed@boutique.dj",
        password: clientPassword,
        role: "CLIENT",
        phone: "+253 77 55 44 33",
      },
    })

    // Create products for shop 1 (Alimentation)
    const shop1Products = await Promise.all([
      await db.product.create({
        data: {
          name: "Riz Basmati 5kg",
          description: "Riz basmati de qualité supérieure, importé d'Inde. Parfait pour tous vos plats.",
          price: 4500,
          category: "Alimentation",
          isAvailable: true,
          shopId: shop1.id,
        },
      }),
      await db.product.create({
        data: {
          name: "Huile de cuisson 5L",
          description: "Huile végétale pour la cuisine quotidienne. Marque de confiance.",
          price: 6000,
          category: "Alimentation",
          isAvailable: true,
          shopId: shop1.id,
        },
      }),
      await db.product.create({
        data: {
          name: "Sucre blanc 2kg",
          description: "Sucre blanc raffiné pour vos boissons et pâtisseries.",
          price: 2000,
          category: "Alimentation",
          isAvailable: true,
          shopId: shop1.id,
        },
      }),
      await db.product.create({
        data: {
          name: "Lait en poudre 400g",
          description: "Lait en poudre entier. Idéal pour le thé et la cuisine.",
          price: 2500,
          category: "Alimentation",
          isAvailable: true,
          shopId: shop1.id,
        },
      }),
      await db.product.create({
        data: {
          name: "Pâtes Spaghetti 1kg",
          description: "Pâtes de qualité, cuisson rapide. Marque populaire.",
          price: 1200,
          category: "Alimentation",
          isAvailable: true,
          shopId: shop1.id,
        },
      }),
      db.product.create({
        data: {
          name: "Café Djibouti 250g",
          description: "Café torréfié localement. Saveur authentique de Djibouti.",
          price: 3000,
          category: "Alimentation",
          isAvailable: false,
          shopId: shop1.id,
        },
      }),
      db.product.create({
        data: {
          name: "Conserve de thon 170g",
          description: "Thon à l'huile végétale. Pratique et nutritif.",
          price: 800,
          category: "Alimentation",
          isAvailable: true,
          shopId: shop1.id,
        },
      }),
      db.product.create({
        data: {
          name: "Farine de blé 2kg",
          description: "Farine de blé tout usage pour vos préparations.",
          price: 1800,
          category: "Alimentation",
          isAvailable: true,
          shopId: shop1.id,
        },
      }),
    ])

    // Create products for shop 2 (Électronique)
    const shop2Products = await Promise.all([
      db.product.create({
        data: {
          name: "Samsung Galaxy A14",
          description: "Smartphone Samsung Galaxy A14, 64GB, écran 6.6 pouces. Garantie 1 an.",
          price: 45000,
          category: "Électronique",
          isAvailable: true,
          shopId: shop2.id,
        },
      }),
      db.product.create({
        data: {
          name: "Écouteurs Bluetooth",
          description: "Écouteurs sans fil avec réduction de bruit. Autonomie 8h.",
          price: 8000,
          category: "Électronique",
          isAvailable: true,
          shopId: shop2.id,
        },
      }),
      db.product.create({
        data: {
          name: "Chargeur universel",
          description: "Chargeur rapide USB-C compatible tous smartphones. 20W.",
          price: 3500,
          category: "Électronique",
          isAvailable: true,
          shopId: shop2.id,
        },
      }),
      db.product.create({
        data: {
          name: "Câble USB-C 1m",
          description: "Câble de charge et données USB-C. Résistant et durable.",
          price: 1500,
          category: "Électronique",
          isAvailable: true,
          shopId: shop2.id,
        },
      }),
      db.product.create({
        data: {
          name: "Powerbank 10000mAh",
          description: "Batterie externe portable. Double port USB. Compact et léger.",
          price: 6500,
          category: "Électronique",
          isAvailable: true,
          shopId: shop2.id,
        },
      }),
      db.product.create({
        data: {
          name: "Télé LED 32 pouces",
          description: "Téléviseur LED HD 32 pouces. HDMI, USB. Livraison disponible.",
          price: 55000,
          category: "Électronique",
          isAvailable: false,
          shopId: shop2.id,
        },
      }),
      db.product.create({
        data: {
          name: "Housse Samsung A14",
          description: "Coque de protection en silicone souple. Coloris assortis.",
          price: 2000,
          category: "Électronique",
          isAvailable: true,
          shopId: shop2.id,
        },
      }),
      db.product.create({
        data: {
          name: "Enceinte Bluetooth portable",
          description: "Enceinte waterproof avec basses profondes. Autonomie 12h.",
          price: 12000,
          category: "Électronique",
          isAvailable: true,
          shopId: shop2.id,
        },
      }),
    ])

    // Create products for shop 3 (Mode)
    const shop3Products = await Promise.all([
      db.product.create({
        data: {
          name: "Tenue traditionnelle djiboutienne",
          description: "Tenue complète en tissu léger, broderie artisanale. Disponible en plusieurs coloris.",
          price: 25000,
          category: "Mode",
          isAvailable: true,
          shopId: shop3.id,
        },
      }),
      db.product.create({
        data: {
          name: "Boubou homme élégant",
          description: "Boubou en coton premium, finitions soignées. Pour les grandes occasions.",
          price: 18000,
          category: "Mode",
          isAvailable: true,
          shopId: shop3.id,
        },
      }),
      db.product.create({
        data: {
          name: "Voile hijab premium",
          description: "Voile en mousseline douce, tissu respirant. Couleurs variées.",
          price: 3500,
          category: "Mode",
          isAvailable: true,
          shopId: shop3.id,
        },
      }),
      db.product.create({
        data: {
          name: "Ensemble wax africain",
          description: "Ensemble complet en tissu wax, coupe moderne. Patron unique.",
          price: 15000,
          category: "Mode",
          isAvailable: true,
          shopId: shop3.id,
        },
      }),
      db.product.create({
        data: {
          name: "Sandales cuir artisanal",
          description: "Sandales en cuir véritable, fabrication artisanale. Confort garanti.",
          price: 8000,
          category: "Mode",
          isAvailable: true,
          shopId: shop3.id,
        },
      }),
      db.product.create({
        data: {
          name: "Sac à main cuir",
          description: "Sac en cuir synthétique de qualité. Plusieurs compartiments.",
          price: 12000,
          category: "Mode",
          isAvailable: false,
          shopId: shop3.id,
        },
      }),
      db.product.create({
        data: {
          name: "Robe de soirée",
          description: "Robe élégante pour événements spéciaux. Tissu satiné.",
          price: 22000,
          category: "Mode",
          isAvailable: true,
          shopId: shop3.id,
        },
      }),
      db.product.create({
        data: {
          name: "Chemise coton premium",
          description: "Chemise en coton 100%, coupe ajustée. Idéale pour le bureau.",
          price: 6500,
          category: "Mode",
          isAvailable: true,
          shopId: shop3.id,
        },
      }),
    ])

    // Create products for shop 4 (Santé)
    const shop4Products = await Promise.all([
      db.product.create({
        data: {
          name: "Paracétamol 500mg x20",
          description: "Comprimés de paracétamol 500mg. Soulage la douleur et la fièvre.",
          price: 1500,
          category: "Santé",
          isAvailable: true,
          shopId: shop4.id,
        },
      }),
      db.product.create({
        data: {
          name: "Sachets ORS x10",
          description: "Sels de réhydratation orale. Essentiels contre la déshydratation.",
          price: 2000,
          category: "Santé",
          isAvailable: true,
          shopId: shop4.id,
        },
      }),
      db.product.create({
        data: {
          name: "Masques chirurgicaux x50",
          description: "Masques jetables à 3 couches. Protection efficace.",
          price: 5000,
          category: "Santé",
          isAvailable: true,
          shopId: shop4.id,
        },
      }),
      db.product.create({
        data: {
          name: "Thermomètre digital",
          description: "Thermomètre médical précis. Lecture rapide en 30 secondes.",
          price: 4000,
          category: "Santé",
          isAvailable: true,
          shopId: shop4.id,
        },
      }),
      db.product.create({
        data: {
          name: "Gel hydroalcoolique 500ml",
          description: "Gel désinfectant pour les mains. 70% alcool.",
          price: 3000,
          category: "Santé",
          isAvailable: true,
          shopId: shop4.id,
        },
      }),
      db.product.create({
        data: {
          name: "Vitamine C 1000mg x30",
          description: "Complément alimentaire. Renforce les défenses immunitaires.",
          price: 4500,
          category: "Santé",
          isAvailable: true,
          shopId: shop4.id,
        },
      }),
      db.product.create({
        data: {
          name: "Pansements adhésifs x20",
          description: "Pansements assortis pour petites coupures. Hypoallergéniques.",
          price: 1200,
          category: "Santé",
          isAvailable: true,
          shopId: shop4.id,
        },
      }),
      db.product.create({
        data: {
          name: "Tensiomètre automatique",
          description: "Appareil de mesure de tension artérielle. Écran LCD.",
          price: 15000,
          category: "Santé",
          isAvailable: false,
          shopId: shop4.id,
        },
      }),
    ])

    // Create products for shop 5 (Services)
    const shop5Products = await Promise.all([
      db.product.create({
        data: {
          name: "Cours de soutien maths",
          description: "Cours particulier de mathématiques. Primaire et secondaire. 1h30 par séance.",
          price: 5000,
          category: "Services",
          isAvailable: true,
          shopId: shop5.id,
        },
      }),
      db.product.create({
        data: {
          name: "Réparation téléphone",
          description: "Réparation écran, batterie, connecteur. Devis gratuit. Toutes marques.",
          price: 8000,
          category: "Services",
          isAvailable: true,
          shopId: shop5.id,
        },
      }),
      db.product.create({
        data: {
          name: "Nettoyage maison 3 pièces",
          description: "Service de nettoyage complet. Produits fournis. Résultat garanti.",
          price: 10000,
          category: "Services",
          isAvailable: true,
          shopId: shop5.id,
        },
      }),
      db.product.create({
        data: {
          name: "Livraison courses",
          description: "Service de livraison de courses. Zone Djibouti-ville. Sous 2h.",
          price: 2000,
          category: "Services",
          isAvailable: true,
          shopId: shop5.id,
        },
      }),
      db.product.create({
        data: {
          name: "Couture et retouche",
          description: "Retouches, ourlets et couture sur mesure. Travail soigné.",
          price: 3000,
          category: "Services",
          isAvailable: true,
          shopId: shop5.id,
        },
      }),
      db.product.create({
        data: {
          name: "Service de traduction",
          description: "Traduction français-arabe-anglais. Documents officiels et courants.",
          price: 7000,
          category: "Services",
          isAvailable: true,
          shopId: shop5.id,
        },
      }),
      db.product.create({
        data: {
          name: "Cours d'informatique",
          description: "Initiation à l'informatique, Word, Excel, Internet. 2h par séance.",
          price: 4000,
          category: "Services",
          isAvailable: true,
          shopId: shop5.id,
        },
      }),
      db.product.create({
        data: {
          name: "Service photo et impression",
          description: "Photos passeport, impressions photo, agrandissements. Qualité professionnelle.",
          price: 3500,
          category: "Services",
          isAvailable: true,
          shopId: shop5.id,
        },
      }),
    ])

    // Create sample orders
    await db.order.create({
      data: {
        shopId: shop1.id,
        customerName: "Hassan Ibrahim",
        customerPhone: "+253 77 22 33 44",
        customerNote: "Livraison le matin SVP",
        deliveryAddress: "Quartier 3, près de la mosquée",
        total: shop1Products[0].price * 2 + shop1Products[3].price,
        status: "PENDING",
        clientId: client.id,
        items: {
          create: [
            { productId: shop1Products[0].id, productName: shop1Products[0].name, quantity: 2, price: shop1Products[0].price },
            { productId: shop1Products[3].id, productName: shop1Products[3].name, quantity: 1, price: shop1Products[3].price },
          ],
        },
      },
    })

    await db.order.create({
      data: {
        shopId: shop2.id,
        customerName: "Amina Youssouf",
        customerPhone: "+253 77 55 66 77",
        deliveryAddress: "Quartier 5, rue de l'hôpital",
        total: shop2Products[1].price + shop2Products[2].price,
        status: "CONFIRMED",
        items: {
          create: [
            { productId: shop2Products[1].id, productName: shop2Products[1].name, quantity: 1, price: shop2Products[1].price },
            { productId: shop2Products[2].id, productName: shop2Products[2].name, quantity: 1, price: shop2Products[2].price },
          ],
        },
      },
    })

    await db.order.create({
      data: {
        shopId: shop1.id,
        customerName: "Khadra Mahamoud",
        customerPhone: "+253 77 88 99 00",
        customerNote: "Merci d'inclure un sac",
        deliveryAddress: "Quartier 1, marché central",
        total: shop1Products[1].price + shop1Products[4].price * 3,
        status: "DELIVERED",
        clientId: client.id,
        items: {
          create: [
            { productId: shop1Products[1].id, productName: shop1Products[1].name, quantity: 1, price: shop1Products[1].price },
            { productId: shop1Products[4].id, productName: shop1Products[4].name, quantity: 3, price: shop1Products[4].price },
          ],
        },
      },
    })

    await db.order.create({
      data: {
        shopId: shop3.id,
        customerName: "Fatouma Abdillahi",
        customerPhone: "+253 77 11 22 33",
        customerNote: "Taille M si possible",
        total: shop3Products[0].price + shop3Products[2].price * 2,
        status: "PENDING",
        clientId: client.id,
        items: {
          create: [
            { productId: shop3Products[0].id, productName: shop3Products[0].name, quantity: 1, price: shop3Products[0].price },
            { productId: shop3Products[2].id, productName: shop3Products[2].name, quantity: 2, price: shop3Products[2].price },
          ],
        },
      },
    })

    await db.order.create({
      data: {
        shopId: shop4.id,
        customerName: "Omar Djama",
        customerPhone: "+253 77 44 55 66",
        total: shop4Products[0].price * 2 + shop4Products[4].price,
        status: "CONFIRMED",
        items: {
          create: [
            { productId: shop4Products[0].id, productName: shop4Products[0].name, quantity: 2, price: shop4Products[0].price },
            { productId: shop4Products[4].id, productName: shop4Products[4].name, quantity: 1, price: shop4Products[4].price },
          ],
        },
      },
    })

    await db.order.create({
      data: {
        shopId: shop5.id,
        customerName: "Nasra Moussa",
        customerPhone: "+253 77 66 77 88",
        customerNote: "Séance le samedi matin",
        total: shop5Products[0].price * 4,
        status: "DELIVERED",
        clientId: client.id,
        items: {
          create: [
            { productId: shop5Products[0].id, productName: shop5Products[0].name, quantity: 4, price: shop5Products[0].price },
          ],
        },
      },
    })

    await db.order.create({
      data: {
        shopId: shop2.id,
        customerName: "Ibrahim Warsama",
        customerPhone: "+253 77 99 00 11",
        total: shop2Products[0].price + shop2Products[6].price,
        status: "CANCELLED",
        items: {
          create: [
            { productId: shop2Products[0].id, productName: shop2Products[0].name, quantity: 1, price: shop2Products[0].price },
            { productId: shop2Products[6].id, productName: shop2Products[6].name, quantity: 1, price: shop2Products[6].price },
          ],
        },
      },
    })

    await db.order.create({
      data: {
        shopId: shop3.id,
        customerName: "Halima Osman",
        customerPhone: "+253 77 12 34 99",
        deliveryAddress: "Quartier 7, avenue de la liberté",
        total: shop3Products[3].price + shop3Products[6].price,
        status: "CONFIRMED",
        items: {
          create: [
            { productId: shop3Products[3].id, productName: shop3Products[3].name, quantity: 1, price: shop3Products[3].price },
            { productId: shop3Products[6].id, productName: shop3Products[6].name, quantity: 1, price: shop3Products[6].price },
          ],
        },
      },
    })

    return NextResponse.json({
      message: "Base de données initialisée avec succès !",
      data: {
        users: 6,
        shops: 5,
        products: shop1Products.length + shop2Products.length + shop3Products.length + shop4Products.length + shop5Products.length,
        orders: 8,
        accounts: {
          admin: { email: "admin@boutique.dj", password: "admin123" },
          merchant1: { email: "ahmed@boutique.dj", password: "marchand123" },
          merchant2: { email: "fatima@boutique.dj", password: "marchand123" },
          merchant3: { email: "amina@boutique.dj", password: "marchand123" },
          merchant4: { email: "ismael@boutique.dj", password: "marchand123" },
          merchant5: { email: "youssef@boutique.dj", password: "marchand123" },
          client: { email: "mohamed@boutique.dj", password: "client123" },
        },
      },
    })
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation de la base de données", details: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
