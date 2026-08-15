/**
 * ODSArts — Search Service
 *
 * Mock: JS filter across name + tagline + materials (all available in mock)
 * Real: GET /search?q={query} → Laravel full-text search
 *
 * Flip NEXT_PUBLIC_USE_MOCK_DATA=false for live API.
 */

import { apiFetch } from '@/lib/api/client'
import { MOCK_PRODUCTS } from '@/lib/mock/products'
import { MOCK_ART } from '@/lib/mock/art'
import { toFrontendProduct, type ApiProduct } from '@/lib/services/products'
import { toFrontendArt, type ApiArtProduct } from '@/lib/services/art'
import type { Product } from '@/lib/types/product'
import type { ArtProduct } from '@/lib/types/art'

/** Raw `/search` payload — snake_case, needs the same mapping as every other list. */
interface ApiSearchResult {
  products: ApiProduct[]
  art: ApiArtProduct[]
  total: number
}

// `/search` is live (Aug 2026). Set NEXT_PUBLIC_SEARCH_API_READY=true to query
// Laravel instead of filtering the fixtures in lib/mock/.
const USE_MOCK = process.env.NEXT_PUBLIC_SEARCH_API_READY !== 'true'

export interface SearchResult {
  products: Product[]
  art: ArtProduct[]
  total: number
}

/**
 * Search both frames and art by name, tagline, and materials.
 * Returns up to `limit` results total (default 6).
 */
export async function searchGlobal(
  query: string,
  limit = 6
): Promise<SearchResult> {
  const q = query.trim().toLowerCase()
  if (!q) return { products: [], art: [], total: 0 }

  if (USE_MOCK) {
    await Promise.resolve()
    const matchesProducts = MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.materials.some((m) => m.toLowerCase().includes(q))
    )
    const matchesArt = MOCK_ART.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.categorySlug.toLowerCase().includes(q)
    )
    
    const total = matchesProducts.length + matchesArt.length
    
    // Simple mixing logic: take from both up to limit
    const products = matchesProducts.slice(0, limit)
    const remainingLimit = limit - products.length
    const art = matchesArt.slice(0, remainingLimit)

    return { products, art, total }
  }

  // Real API: GET /search?q=walnut&limit=6 — mapped to frontend types, since
  // the endpoint returns the same snake_case shape as the catalogue endpoints.
  const raw = await apiFetch<ApiSearchResult>(
    `/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { revalidate: false }
  )

  return {
    products: (raw.products ?? []).map(toFrontendProduct),
    art: (raw.art ?? []).map(toFrontendArt),
    total: raw.total ?? 0,
  }
}
