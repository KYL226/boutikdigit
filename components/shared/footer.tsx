'use client'

import { Store, Heart, MessageCircle } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

export default function Footer() {
  const { setView } = useAppStore()

  return (
    <footer className="border-t bg-gradient-to-b from-gray-50 to-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                BoutikDigit
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plateforme de digitalisation des boutiques de quartier. 
              Commandez facilement auprès de vos commerçants locaux.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Navigation</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setView('home')}
                className="text-sm text-muted-foreground hover:text-orange-600 transition-colors text-left"
              >
                Accueil
              </button>
              <button
                onClick={() => setView('favorites')}
                className="text-sm text-muted-foreground hover:text-orange-600 transition-colors text-left"
              >
                Mes favoris
              </button>
              <button
                onClick={() => setView('login')}
                className="text-sm text-muted-foreground hover:text-orange-600 transition-colors text-left"
              >
                Espace marchand
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span>Support WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Fait avec amour par Digit Tech Group</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 pt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © 2026 BoutikDigit — Digitalisation des boutiques de quartier
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button className="hover:text-orange-600 transition-colors">Conditions d&apos;utilisation</button>
              <button className="hover:text-orange-600 transition-colors">Confidentialité</button>
              <button className="hover:text-orange-600 transition-colors">Aide</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
