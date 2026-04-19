"use client"

import { useEffect } from "react"
import Header from "@/components/shared/header"
import Footer from "@/components/shared/footer"
import { useAuthStore } from "@/store/auth-store"

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-6">{children}</main>
      <Footer />
    </div>
  )
}
