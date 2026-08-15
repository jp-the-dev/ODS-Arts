/**
 * ODSArts — Product Service
 *
 * Transforms the Laravel API response into the frontend Product type.
 * The API returns flat products (one per size); the frontend expects
 * a `variants`-based structure for unified rendering.
 */

import { apiFetch, ApiError } from '@/lib/api/client'
import { MOCK_PRODUCTS } from '@/lib/mock/products'
import type { Product, ProductImage as ProductImageType } from '@/lib/types/product'
import type { ProductFilterParams } from '@/lib/types/filters'
import { serializeFilters } from '@/lib/types/filters'

// ── Raw API shapes ────────────────────────────────────────────────────────────

interface ApiProductImage {
  id: number
  url: string
  alt: string | null
  sort_order: number
}

interface ApiCollectionSummary {
  id: number
  slug: string
  name: string
}

interface ApiProductVariant {
  id: string
  sku: string
  size_label: string
  dimensions_cm: string | null
  base_price_paise: number
  stock_qty: number
  weight_grams: number
}

interface ApiFinishOption {
  id: string
  name: string
  swatch_hex: string | null
  price_delta_paise: number
}

export interface ApiProduct {
  id: number
  slug: string
  name: string
  tagline: string | null
  description: string
  delivery_days: number
  care_instructions: string[]
  material: string
  materials: string[]
  dimensions: string
  price: number
  is_featured: boolean
  collection: ApiCollectionSummary
  images: ApiProductImage[]
  variants: ApiProductVariant[]
  finish_options: ApiFinishOption[]
}

type GetProductsResponse = ApiProduct[]

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// ── Lowest price helper ───────────────────────────────────────────────────────

function lowestPrice(p: Product) {
  return Math.min(...p.variants.map((v) => v.basePricePaise))
}

// ── Transformer ────────────────────────────────────────────────────────────────

export function toFrontendProduct(p: ApiProduct): Product {
  const images: ProductImageType[] = p.images.map((img, i) => ({
    url: img.url,
    alt: img.alt || p.name,
    role: i === 0 ? 'hero' : 'detail',
  }))

  return {
    id: String(p.id),
    slug: p.slug,
    collectionSlug: p.collection.slug,
    name: p.name,
    tagline: p.tagline ?? '',
    description: p.description,
    deliveryDays: p.delivery_days ?? 14,
    currency: 'INR',
    // Real variants when the API supplies them. The fallback synthesises a single
    // variant from the product's own price so products that predate the
    // product_variants table still render.
    variants: p.variants?.length
      ? p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          sizeLabel: v.size_label,
          dimensionsCm: v.dimensions_cm ?? v.size_label,
          basePricePaise: v.base_price_paise,
          stockQty: v.stock_qty,
          weightGrams: v.weight_grams,
        }))
      : [
          {
            id: `v-${p.id}`,
            sku: p.slug.toUpperCase().replace(/-/g, '_'),
            sizeLabel: p.dimensions,
            dimensionsCm: p.dimensions,
            basePricePaise: Math.round(p.price * 100),
            stockQty: 0,
            weightGrams: 0,
          },
        ],
    finishOptions: (p.finish_options ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      swatchHex: f.swatch_hex ?? '#000000',
      priceDeltaPaise: f.price_delta_paise,
    })),
    images,
    careInstructions: p.care_instructions ?? [],
    materials: p.materials?.length ? p.materials : [p.material],
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getProductsByCollection(
  collectionSlug: string,
): Promise<Product[]> {
  if (USE_MOCK) {
    await Promise.resolve()
    return MOCK_PRODUCTS.filter((p) => p.collectionSlug === collectionSlug)
  }
  const all = await getAllProducts()
  return all.filter((p) => p.collectionSlug === collectionSlug)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (USE_MOCK) {
    await Promise.resolve() // Simulate network latency
    return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null
  }
  try {
    // apiFetch already unwraps Laravel's `{ data: ... }` envelope, so this must
    // not reach for `.data` a second time.
    const raw = await apiFetch<ApiProduct>(`/products/${slug}`)

    return toFrontendProduct(raw)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await Promise.resolve() // Simulate network latency
    return MOCK_PRODUCTS
  }
  const raw = await apiFetch<GetProductsResponse>('/products')
  return raw.map(toFrontendProduct)
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

  // Real API — pass all filters as query params.
  // The response must go through toFrontendProduct() like every other path here;
  // returning the raw payload would type as Product[] but carry snake_case fields
  // and no `variants`, so any caller reading `.variants` would get undefined.
  const qs = serializeFilters(params).toString()
  const raw = await apiFetch<GetProductsResponse>(
    `/products${qs ? `?${qs}` : ''}`,
    { revalidate: false } // dynamic filtered pages should not be cached
  )

  return raw.map(toFrontendProduct)
}

