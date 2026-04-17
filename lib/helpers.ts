export function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateWhatsAppLink(
  shopPhone: string,
  items: { name: string; quantity: number; price: number }[],
  shopName: string
): string {
  const itemList = items
    .map((item) => `• ${item.name} x${item.quantity} (${formatPrice(item.price * item.quantity)})`)
    .join('\n')
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const message = `Bonjour, je souhaite commander chez ${shopName} :\n\n${itemList}\n\nTotal : ${formatPrice(total)}\n\nMerci !`
  const encodedMessage = encodeURIComponent(message)
  const cleanPhone = shopPhone.replace(/\s+/g, '').replace('+', '')
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Alimentation: '🛒',
    Électronique: '📱',
    Mode: '👗',
    Santé: '💊',
    Services: '🔧',
    General: '🏪',
  }
  return icons[category] || '🏪'
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Alimentation: 'bg-green-100 text-green-800',
    Électronique: 'bg-purple-100 text-purple-800',
    Mode: 'bg-pink-100 text-pink-800',
    Santé: 'bg-red-100 text-red-800',
    Services: 'bg-amber-100 text-amber-800',
    General: 'bg-gray-100 text-gray-800',
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
  }
  return labels[status] || status
}
