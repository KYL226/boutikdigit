import AppShell from "@/components/shared/app-shell"
import ShopView from "@/components/views/shop-view"

interface ShopByIdPageProps {
  params: Promise<{ id: string }>
}

export default async function ShopByIdPage({ params }: ShopByIdPageProps) {
  const { id } = await params

  return (
    <AppShell>
      <ShopView shopId={id} />
    </AppShell>
  )
}
