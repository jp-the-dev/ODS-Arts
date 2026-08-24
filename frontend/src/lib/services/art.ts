/**
 * ODSArts — Art Service
 *
 * Mock: JS filter on MOCK_ART array
 * Real: apiFetch() → Laravel GET /art/...
 *
 * Flip NEXT_PUBLIC_USE_MOCK_DATA=false to switch to real API.
 */

import { apiFetch, ApiError } from '@/lib/api/client'
import { MOCK_ART } from '@/lib/mock/art'
import { artLowestPrice } from '@/lib/types/art'
import type { ArtProduct, ArtStyle, PrintMaterial } from '@/lib/types/art'

// ── Raw API shapes ────────────────────────────────────────────────────────────

interface ApiArtMaterialVariant {
  id: number | string
  sku: string
  material: PrintMaterial
  size_label: string
  dimensions_cm: string | null
  price_paise: number
  stock_qty: number
  weight_grams: number
}

interface ApiArtImage {
  url: string
  alt: string | null
  role: 'hero' | 'detail' | 'lifestyle'
}

export interface ApiArtProduct {
  id: number | string
  slug: string
  category_slug: ArtStyle
  name: string
  tagline: string | null
  description: string
  artist: string
  medium: string
  delivery_days: number
  currency: 'INR'
  material_variants: ApiArtMaterialVariant[]
  images: ApiArtImage[]
  tags: string[]
}

/** Laravel returns snake_case; the UI is typed camelCase. */
export function toFrontendArt(a: ApiArtProduct): ArtProduct {
  return {
    id: String(a.id),
    slug: a.slug,
    categorySlug: a.category_slug,
    name: a.name,
    tagline: a.tagline ?? '',
    description: a.description,
    artist: a.artist,
    medium: a.medium,
    deliveryDays: a.delivery_days,
    currency: 'INR',
    materialVariants: (a.material_variants ?? []).map((v) => ({
      id: String(v.id),
      sku: v.sku,
      material: v.material,
      sizeLabel: v.size_label,
      dimensionsCm: v.dimensions_cm ?? v.size_label,
      pricePaise: v.price_paise,
      stockQty: v.stock_qty,
      weightGrams: v.weight_grams,
    })),
    images: (a.images ?? []).map((img) => ({
      url: img.url,
      alt: img.alt || a.name,
      role: img.role,
    })),
    tags: a.tags ?? [],
  }
}

// `/art`, `/art/featured` and `/art/{slug}` are live (ported Aug 2026, §3.8).
// Set NEXT_PUBLIC_ART_API_READY=true to read from Laravel instead of the
// fixtures in lib/mock/art.ts.
const USE_MOCK = process.env.NEXT_PUBLIC_ART_API_READY !== 'true'

/**
 * Filter + sort a list of art in JS.
 *
 * `GET /art` now supports the same filters server-side, but the catalogue is
 * small enough (18 pieces) that narrowing the already-fetched list is instant
 * and avoids a request per filter change. Switch to the query-string form if the
 * catalogue outgrows a single fetch.
 */
function applyArtFilters(source: ArtProduct[], params: ArtFilterParams): ArtProduct[] {
  let result = [...source]

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
      const lowestPrice = artLowestPrice(a)
      const min = params.minPricePaise ?? 0
      const max = params.maxPricePaise ?? Infinity
      return lowestPrice >= min && lowestPrice <= max
    })
  }

  if (params.inStockOnly) {
    result = result.filter((a) => a.materialVariants.some((v) => v.stockQty > 0))
  }

  switch (params.sort) {
    case 'price_asc':
      result.sort((a, b) => artLowestPrice(a) - artLowestPrice(b))
      break
    case 'price_desc':
      result.sort((a, b) => artLowestPrice(b) - artLowestPrice(a))
      break
    case 'newest':
      result.reverse()
      break
  }

  return result
}

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
  const raw = await apiFetch<ApiArtProduct[]>('/art', { revalidate: 3600 })

  return raw.map(toFrontendArt)
}

/** All art in a single category */
export async function getArtByCategory(categorySlug: ArtStyle): Promise<ArtProduct[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_ART.filter((a) => a.categorySlug === categorySlug)
  }
  // The API exposes a category's art via /art?category=, not a nested route.
  const raw = await apiFetch<ApiArtProduct[]>('/art', { revalidate: 3600 })

  return raw.map(toFrontendArt).filter((a) => a.categorySlug === categorySlug)
}

/** Single art product by slug */
export async function getArtBySlug(slug: string): Promise<ArtProduct | null> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_ART.find((a) => a.slug === slug) ?? null
  }
  try {
    const raw = await apiFetch<ApiArtProduct>(`/art/${slug}`, { revalidate: 3600 })

    return toFrontendArt(raw)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** Filtered + sorted art — JS in mock, query string on real API */
export async function getFilteredArt(params: ArtFilterParams): Promise<{ art: ArtProduct[]; total: number }> {
  const source = await getAllArt()
  const art = applyArtFilters(source, params)

  return { art, total: art.length }
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

  const raw = await apiFetch<{ art: ApiArtProduct[]; total: number }>(
    `/search?q=${encodeURIComponent(q)}&type=art&limit=${limit}`,
    { revalidate: false }
  )

  return { art: (raw.art ?? []).map(toFrontendArt), total: raw.total ?? 0 }
}
