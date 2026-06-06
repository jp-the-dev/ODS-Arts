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
import type { ProductFilterParams } from '@/lib/types/filters'
import { serializeFilters } from '@/lib/types/filters'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// ── Lowest price helper ───────────────────────────────────────────────────────

function lowestPrice(p: Product) {
  return Math.min(...p.variants.map((v) => v.basePricePaise))
}

// ── GET /collections/:slug/products ──────────────────────────────────────────

/**
 * Returns all products (variants) for a given collection slug.
 */
export async function getProductsByCollection(
  collectionSlug: string
): Promise<Product[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_PRODUCTS.filter((p) => p.collectionSlug === collectionSlug)
  }
  return apiFetch<GetProductsResponse>(
    `/collections/${collectionSlug}/products`,
    { revalidate: 3600 }
  )
}

// ── GET /products/:slug ───────────────────────────────────────────────────────

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

// ── GET /products (all) ───────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_PRODUCTS
  }
  return apiFetch<Product[]>('/products', { revalidate: 3600 })
}

// ── GET /products?filters... ──────────────────────────────────────────────────

/**
 * Filtered product fetch — used by FrameGrid when backend is live.
 *
 * Mock: applies all filters in JavaScript.
 * Real: passes filters as query params to GET /products?c=walnut&sort=price_asc...
 *
 * Filtering is based on LOWEST variant price, per product spec.
 */
export async function getFilteredProducts(
  params: ProductFilterParams
): Promise<Product[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    let list = [...MOCK_PRODUCTS]

    // Collection filter
    if (params.collections?.length) {
      list = list.filter((p) => params.collections!.includes(p.collectionSlug))
    }

    // Size filter — product must have at least one variant matching
    if (params.sizes?.length) {
      list = list.filter((p) =>
        p.variants.some((v) => params.sizes!.includes(v.sizeLabel))
      )
    }

    // Price range — based on lowest variant price
    if (params.minPricePaise != null) {
      list = list.filter((p) => lowestPrice(p) >= params.minPricePaise!)
    }
    if (params.maxPricePaise != null) {
      list = list.filter((p) => lowestPrice(p) <= params.maxPricePaise!)
    }

    // In-stock filter
    if (params.inStockOnly) {
      list = list.filter((p) => p.variants.some((v) => v.stockQty > 0))
    }

    // Full-text search: name + tagline + materials
    if (params.query?.trim()) {
      const q = params.query.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.materials.some((m) => m.toLowerCase().includes(q))
      )
    }

    // Sort
    switch (params.sort) {
      case 'price_asc':
        list.sort((a, b) => lowestPrice(a) - lowestPrice(b))
        break
      case 'price_desc':
        list.sort((a, b) => lowestPrice(b) - lowestPrice(a))
        break
      case 'delivery_asc':
        list.sort((a, b) => a.deliveryDays - b.deliveryDays)
        break
      // 'recommended' and 'newest' — keep mock order (newest = MOCK order)
    }

    return list
  }

  // Real API — pass all filters as query params
  const qs = serializeFilters(params).toString()
  return apiFetch<Product[]>(`/products${qs ? `?${qs}` : ''}`, {
    revalidate: false, // dynamic filtered pages should not be cached
  })
}

