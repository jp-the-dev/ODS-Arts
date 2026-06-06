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
import type { ArtProduct, ArtStyle, PrintMaterial, ArtMaterialVariant } from '@/lib/types/art'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// ── API response shapes ───────────────────────────────────────────────────────

interface ApiArtImage {
  id: number
  url: string
  alt: string | null
  role: string
}

interface ApiArtMaterialVariant {
  id: number
  sku: string
  material: string
  size_label: string
  dimensions_cm: string
  price_paise: number
  stock_qty: number
  weight_grams: number
}

interface ApiArtProduct {
  id: number
  slug: string
  category_slug: string
  name: string
  tagline: string | null
  description: string | null
  artist: string
  medium: string | null
  delivery_days: number
  currency: string
  material_variants: ApiArtMaterialVariant[]
  images: ApiArtImage[]
  tags: string[]
}

interface ApiArtCategory {
  id: number
  slug: string
  title: string
  art_products: ApiArtProduct[]
}

// ── Transformer ───────────────────────────────────────────────────────────────

function toFrontendArtProduct(p: ApiArtProduct): ArtProduct {
  const materialVariants: ArtMaterialVariant[] = p.material_variants.map((v) => ({
    id: `${p.slug}__${v.material}__${v.size_label.replace(/[^\w]/g, '')}`,
    sku: v.sku,
    material: v.material as PrintMaterial,
    sizeLabel: v.size_label,
    dimensionsCm: v.dimensions_cm,
    pricePaise: v.price_paise,
    stockQty: v.stock_qty,
    weightGrams: v.weight_grams,
  }))

  return {
    id: String(p.id),
    slug: p.slug,
    categorySlug: p.category_slug as ArtStyle,
    name: p.name,
    tagline: p.tagline ?? '',
    description: p.description ?? '',
    artist: p.artist,
    medium: p.medium ?? '',
    deliveryDays: p.delivery_days,
    currency: 'INR',
    materialVariants,
    images: p.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? '',
      role: img.role as 'hero' | 'detail' | 'lifestyle',
    })),
    tags: p.tags ?? [],
  }
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
  try {
    const raw = await apiFetch<ApiArtProduct[]>('/art', { revalidate: 3600 })
    return raw.map(toFrontendArtProduct)
  } catch {
    return USE_MOCK ? MOCK_ART : []
  }
}

/** All art in a single category */
export async function getArtByCategory(categorySlug: ArtStyle): Promise<ArtProduct[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_ART.filter((a) => a.categorySlug === categorySlug)
  }
  try {
    const raw = await apiFetch<ApiArtCategory>(`/art/categories/${categorySlug}`, { revalidate: 3600 })
    return (raw.art_products ?? []).map(toFrontendArtProduct)
  } catch {
    return []
  }
}

/** Single art product by slug */
export async function getArtBySlug(slug: string): Promise<ArtProduct | null> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_ART.find((a) => a.slug === slug) ?? null
  }
  try {
    const raw = await apiFetch<ApiArtProduct>(`/art/${slug}`, { revalidate: 3600 })
    return toFrontendArtProduct(raw)
  } catch {
    return null
  }
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

  const qp = qs.toString()
  const raw = await apiFetch<ApiArtProduct[]>(`/art${qp ? `?${qp}` : ''}`, { revalidate: 0 })
  const art = raw.map(toFrontendArtProduct)
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

  try {
    const raw = await apiFetch<ApiArtProduct[]>(`/art?q=${encodeURIComponent(q)}`, { revalidate: false })
    const art = raw.map(toFrontendArtProduct)
    return { art: art.slice(0, limit), total: art.length }
  } catch {
    return { art: [], total: 0 }
  }
}
