/**
 * ODSArts — Art Service
 *
 * Mock: JS filter on MOCK_ART array
 * Real: apiFetch() → Laravel GET /art/...
 *
 * Flip NEXT_PUBLIC_USE_MOCK_DATA=false to switch to real API.
 */

import { apiFetch } from '@/lib/api/client'
import { MOCK_ART } from '@/lib/mock/art'
import type { ArtProduct, ArtStyle, PrintMaterial } from '@/lib/types/art'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// ── Filter params (matches backend query string) ──────────────────────────────

export interface ArtFilterParams {
  categorySlug?: ArtStyle[]
  materials?: PrintMaterial[]
  sizes?: string[]
  minPricePaise?: number
  maxPricePaise?: number
  inStockOnly?: boolean
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'newest'
  query?: string
}

// ── Service functions ─────────────────────────────────────────────────────────

/** All art pieces (unfiltered) */
export async function getAllArt(): Promise<ArtProduct[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_ART
  }
  return apiFetch<ArtProduct[]>('/art', { revalidate: 3600 })
}

/** All art in a single category */
export async function getArtByCategory(categorySlug: ArtStyle): Promise<ArtProduct[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_ART.filter((a) => a.categorySlug === categorySlug)
  }
  return apiFetch<ArtProduct[]>(`/art/categories/${categorySlug}/products`, { revalidate: 3600 })
}

/** Single art product by slug */
export async function getArtBySlug(slug: string): Promise<ArtProduct | null> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_ART.find((a) => a.slug === slug) ?? null
  }
  return apiFetch<ArtProduct>(`/art/${slug}`, { revalidate: 3600 })
}

/** Filtered + sorted art — JS in mock, query string on real API */
export async function getFilteredArt(params: ArtFilterParams): Promise<{ art: ArtProduct[]; total: number }> {
  if (USE_MOCK) {
    await Promise.resolve()
    let result = [...MOCK_ART]

    if (params.categorySlug?.length) {
      result = result.filter((a) => params.categorySlug!.includes(a.categorySlug))
    }

    if (params.query) {
      const q = params.query.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tagline.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.medium.toLowerCase().includes(q)
      )
    }

    if (params.materials?.length) {
      result = result.filter((a) =>
        a.materialVariants.some((v) => params.materials!.includes(v.material))
      )
    }

    if (params.sizes?.length) {
      result = result.filter((a) =>
        a.materialVariants.some((v) => params.sizes!.includes(v.sizeLabel))
      )
    }

    if (params.minPricePaise !== undefined || params.maxPricePaise !== undefined) {
      result = result.filter((a) => {
        const lowestPrice = Math.min(...a.materialVariants.map((v) => v.pricePaise))
        const min = params.minPricePaise ?? 0
        const max = params.maxPricePaise ?? Infinity
        return lowestPrice >= min && lowestPrice <= max
      })
    }

    if (params.inStockOnly) {
      result = result.filter((a) => a.materialVariants.some((v) => v.stockQty > 0))
    }

    // Sort
    switch (params.sort) {
      case 'price_asc':
        result.sort((a, b) =>
          Math.min(...a.materialVariants.map((v) => v.pricePaise)) -
          Math.min(...b.materialVariants.map((v) => v.pricePaise))
        )
        break
      case 'price_desc':
        result.sort((a, b) =>
          Math.min(...b.materialVariants.map((v) => v.pricePaise)) -
          Math.min(...a.materialVariants.map((v) => v.pricePaise))
        )
        break
      case 'newest':
        result.reverse()
        break
    }

    return { art: result, total: result.length }
  }

  // Real API: build query string
  const qs = new URLSearchParams()
  if (params.categorySlug?.length)  qs.set('style',    params.categorySlug.join(','))
  if (params.materials?.length)     qs.set('material', params.materials.join(','))
  if (params.sizes?.length)         qs.set('size',     params.sizes.join('|'))
  if (params.minPricePaise != null) qs.set('min_price', String(params.minPricePaise))
  if (params.maxPricePaise != null) qs.set('max_price', String(params.maxPricePaise))
  if (params.inStockOnly)           qs.set('in_stock',  '1')
  if (params.sort)                  qs.set('sort',      params.sort)
  if (params.query)                 qs.set('q',         params.query)

  return apiFetch<{ art: ArtProduct[]; total: number }>(`/art?${qs}`, { revalidate: 0 })
}

/** Search art by name, tagline, tags, medium */
export async function searchArt(query: string, limit = 6): Promise<{ art: ArtProduct[]; total: number }> {
  const q = query.trim().toLowerCase()
  if (!q) return { art: [], total: 0 }

  if (USE_MOCK) {
    const matches = MOCK_ART.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.medium.toLowerCase().includes(q) ||
        a.categorySlug.includes(q)
    )
    return { art: matches.slice(0, limit), total: matches.length }
  }

  return apiFetch<{ art: ArtProduct[]; total: number }>(
    `/search?q=${encodeURIComponent(q)}&type=art&limit=${limit}`,
    { revalidate: false }
  )
}
