// Product data fetching — Server only (uses ISR caching via apiFetch)
import { apiFetch } from '@/lib/api/client'
import type { Product } from '@/types'

export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products', { revalidate: 3600 })
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${slug}`, { revalidate: 3600 })
  } catch {
    return null
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products/featured', { revalidate: 3600 })
}

export async function getBestSellers(): Promise<Product[]> {
  return apiFetch<Product[]>('/products/featured', { revalidate: 3600 })
}
