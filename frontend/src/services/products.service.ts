// Product data fetching — Server only
// Replace static data with API/CMS calls when backend is ready
import type { Product } from '@/types'

export async function getProducts(): Promise<Product[]> {
  return []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return []
}

export async function getBestSellers(): Promise<Product[]> {
  return []
}
