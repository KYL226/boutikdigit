'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Store,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
} from 'lucide-react'

const CATEGORIES = ['Alimentation', 'Électronique', 'Mode', 'Santé', 'Services']

export default function RegisterView() {
  const { setView } = useAppStore()
  const { register } = useAuthStore()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState<'CLIENT' | 'MARCHAND'>('CLIENT')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsapp: '',
    shopName: '',
    shopDescription: '',
    shopWhatsappNumber: '',
    shopLocation: '',
    shopCity: '',
    shopCategory: '',
  })

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        role,
        shopName: role === 'MARCHAND' ? formData.shopName : undefined,
        shopDescription: role === 'MARCHAND' ? formData.shopDescription : undefined,
        shopWhatsappNumber: role === 'MARCHAND' ? formData.shopWhatsappNumber : undefined,
        shopLocation: role === 'MARCHAND' ? formData.shopLocation : undefined,
        shopCity: role === 'MARCHAND' ? formData.shopCity : undefined,
        shopCategory: role === 'MARCHAND' ? formData.shopCategory : undefined,
      })
      if (result.success) {
        toast.success('Compte créé avec succès !')
        const nextView = role === 'MARCHAND' ? 'dashboard' : 'home'
        setView(nextView)
        router.push(nextView === 'dashboard' ? '/dashboard' : '/')
      } else {
        setError(result.error || "Erreur lors de la creation du compte.")
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const canGoNext = () => {
    if (step === 1) return true
    if (step === 2) {
      return formData.name && formData.email && formData.password && formData.confirmPassword
    }
    if (step === 3) {
      return formData.shopName && formData.shopWhatsappNumber && formData.shopLocation && formData.shopCity && formData.shopCategory
    }
    return false
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Store className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Rejoignez la communauté BoutikDigit
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, ...(role === 'MARCHAND' ? [3] : [])].map((s, i, arr) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= s
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                {i < arr.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 ${
                      step > s ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Choose Role */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Qui êtes-vous ?</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole('CLIENT')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    role === 'CLIENT'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ShoppingBag
                    className={`h-8 w-8 mx-auto mb-2 ${
                      role === 'CLIENT' ? 'text-orange-500' : 'text-gray-400'
                    }`}
                  />
                  <p className="font-semibold text-sm">Client</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Je veux commander
                  </p>
                </button>
                <button
                  onClick={() => setRole('MARCHAND')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    role === 'MARCHAND'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store
                    className={`h-8 w-8 mx-auto mb-2 ${
                      role === 'MARCHAND' ? 'text-orange-500' : 'text-gray-400'
                    }`}
                  />
                  <p className="font-semibold text-sm">Marchand</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    J&apos;ai une boutique
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Vos informations</h3>
              <div className="space-y-2">
                <Label htmlFor="reg-name">Nom complet *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Min. 6 caractères"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Confirmer le mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="Retapez le mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-phone"
                    placeholder="+253 77 00 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Shop Info (MARCHAND only) */}
          {step === 3 && role === 'MARCHAND' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Votre boutique</h3>
              <div className="space-y-2">
                <Label htmlFor="shop-name">Nom de la boutique *</Label>
                <Input
                  id="shop-name"
                  placeholder="Ex: Épicerie Al-Baraka"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-desc">Description</Label>
                <Textarea
                  id="shop-desc"
                  placeholder="Décrivez votre boutique..."
                  value={formData.shopDescription}
                  onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-whatsapp">Numéro WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="shop-whatsapp"
                    placeholder="+253 77 00 00 00"
                    value={formData.shopWhatsappNumber}
                    onChange={(e) => setFormData({ ...formData, shopWhatsappNumber: e.target.value })}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="shop-location">Quartier *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="shop-location"
                      placeholder="Quartier"
                      value={formData.shopLocation}
                      onChange={(e) => setFormData({ ...formData, shopLocation: e.target.value })}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-city">Ville *</Label>
                  <Input
                    id="shop-city"
                    placeholder="Ville"
                    value={formData.shopCity}
                    onChange={(e) => setFormData({ ...formData, shopCity: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={formData.shopCategory}
                  onValueChange={(v) => setFormData({ ...formData, shopCategory: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-11"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            )}
            {step < (role === 'MARCHAND' ? 3 : 2) ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
                className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !canGoNext()}
                className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <button
                onClick={() => {
                  setView('login')
                  router.push('/login')
                }}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Se connecter
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
