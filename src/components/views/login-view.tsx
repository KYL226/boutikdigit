'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Store, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function LoginView() {
  const { setView } = useAppStore()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast.success('Connexion réussie !')
        setView('home')
      } else {
        setError('Email ou mot de passe incorrect')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
    setLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast.success('Connexion réussie !')
        setView('home')
      } else {
        setError('Identifiants invalides')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Store className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Accédez à votre compte BoutikDigit
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <button
                onClick={() => setView('register')}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Créer un compte
              </button>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-muted-foreground text-center mb-3">Comptes de démonstration</p>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => demoLogin('admin@boutique.dj', 'admin123')}
              >
                🛡️ Admin — admin@boutique.dj
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => demoLogin('ahmed@boutique.dj', 'marchand123')}
              >
                🛒 Alimentation — ahmed@boutique.dj
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => demoLogin('fatima@boutique.dj', 'marchand123')}
              >
                📱 Électronique — fatima@boutique.dj
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => demoLogin('amina@boutique.dj', 'marchand123')}
              >
                👗 Mode — amina@boutique.dj
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => demoLogin('ismael@boutique.dj', 'marchand123')}
              >
                💊 Santé — ismael@boutique.dj
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => demoLogin('youssef@boutique.dj', 'marchand123')}
              >
                🔧 Services — youssef@boutique.dj
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => demoLogin('mohamed@boutique.dj', 'client123')}
              >
                🛍️ Client — mohamed@boutique.dj
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
