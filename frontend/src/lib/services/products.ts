/**
 * ODSArts — Product Service
 *
 * THE ONLY FILE YOU NEED TO CHANGE WHEN THE BACKEND IS READY.
 *
 * Set NEXT_PUBLIC_USE_MOCK_DATA=false in .env.local and all API calls
 * automatically switch from mock data to the real Laravel backend.
 *
 * Mock  → src/lib/mock/products.ts   (zero network, instant)
 * Real  → apiFetch() via src/lib/api/client.ts  (ISR cached)
 */

import { apiFetch } from '@/lib/api/client'
import { MOCK_PRODUCTS } from '@/lib/mock/products'
import type { Product, GetProductsResponse } from '@/lib/types/product'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// ── GET /collections/:slug/products ──────────────────────────────────────────

/**
 * Returns all products (variants) for a given collection slug.
 * Server Component safe — uses ISR with a 1-hour revalidation by default.
 */
export async function getProductsByCollection(
  collectionSlug: string
): Promise<Product[]> {
  if (USE_MOCK) {
    // Simulate a tiny async delay so behaviour matches real network usage
    await Promise.resolve()
    return MOCK_PRODUCTS.filter((p) => p.collectionSlug === collectionSlug)
  }

  return apiFetch<GetProductsResponse>(
    `/collections/${collectionSlug}/products`,
    { revalidate: 3600 }
  )
}

// ── GET /products/:slug ───────────────────────────────────────────────────────

/**
 * Returns a single product by its slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null
  }

  try {
    return await apiFetch<Product>(`/products/${slug}`, { revalidate: 3600 })
  } catch {
    return null
  }
}

// ── GET /collections/:slug/products (all collections) ────────────────────────

/**
 * Returns all products across all collections.
 * Used for generateStaticParams in SSG.
 */
export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_PRODUCTS
  }

  return apiFetch<Product[]>('/products', { revalidate: 3600 })
}
