const ORANGE_BANNER_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`
)

export const DEFAULT_BANNER_DATA_URI = `data:image/svg+xml;charset=utf-8,${ORANGE_BANNER_SVG}`

export const getInitials = (value: string) => {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
  if (!parts.length) return "?"
  return parts.map((p) => p[0]?.toUpperCase() || "").join("")
}

export const buildInitialsAvatar = (text: string) => {
  const initials = getInitials(text)
  return {
    type: "initials" as const,
    initials,
  }
}

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "boutique"
