import { v2 as cloudinary } from "cloudinary"
import { slugify } from "@/lib/media"

let isConfigured = false

const ensureCloudinaryConfigured = () => {
  if (isConfigured) return
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  isConfigured = true
}

export const getCloudinaryShopFolder = (shopName: string) =>
  `boutikdigit/${slugify(shopName)}`

export async function uploadBase64ToCloudinary(
  dataUri: string,
  options: { shopName: string; kind: "logo" | "banner" | "product" }
) {
  ensureCloudinaryConfigured()
  const folder = getCloudinaryShopFolder(options.shopName)
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    tags: ["boutikdigit", options.kind],
  })
  return result.secure_url
}
