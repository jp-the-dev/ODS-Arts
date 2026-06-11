/**
 * ODSArts — Product Filter Types
 *
 * Used by:
 *   - FrameGrid (client-side filter state → URL params)
 *   - getFilteredProducts() service (mock: JS filter | real: query string)
 *
 * Backend contract: GET /products?collection=walnut,gallery&size=8x10&sort=price_asc ...
 */

export type SortKey =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'delivery_asc'

export interface ProductFilterParams {
  /** Comma-separated collection slugs, e.g. ['walnut', 'gallery'] */
  collections?: string[]
  /** Size labels, e.g. ['8" × 10"', '11" × 14"'] */
  sizes?: string[]
  /** Min price in paise (based on lowest variant price) */
  minPricePaise?: number
  /** Max price in paise (based on lowest variant price) */
  maxPricePaise?: number
  /** When true, only return products with at least one variant in stock */
  inStockOnly?: boolean
  sort?: SortKey
  /** Full-text search: matches name, tagline, materials */
  query?: string
  page?: number
  perPage?: number
}

// ── URL param helpers ──────────────────────────────────────────────────────────

/** Serialize a filter params object to URLSearchParams */
export function serializeFilters(params: ProductFilterParams): URLSearchParams {
  const sp = new URLSearchParams()
  if (params.collections?.length)  sp.set('c',         params.collections.join(','))
  if (params.sizes?.length)        sp.set('s',         params.sizes.join('|'))
  if (params.minPricePaise)        sp.set('min_price', String(params.minPricePaise))
  if (params.maxPricePaise)        sp.set('max_price', String(params.maxPricePaise))
  if (params.inStockOnly)          sp.set('in_stock',  '1')
  if (params.sort && params.sort !== 'recommended') sp.set('sort', params.sort)
  if (params.query)                sp.set('q',         params.query)
  if (params.page && params.page > 1) sp.set('page',   String(params.page))
  return sp
}

/** Parse URLSearchParams back into ProductFilterParams */
export function deserializeFilters(sp: URLSearchParams): ProductFilterParams {
  return {
    collections:   sp.get('c') ? sp.get('c')!.split(',') : undefined,
    sizes:         sp.get('s') ? sp.get('s')!.split('|') : undefined,
    minPricePaise: sp.get('min_price') ? Number(sp.get('min_price')) : undefined,
    maxPricePaise: sp.get('max_price') ? Number(sp.get('max_price')) : undefined,
    inStockOnly:   sp.get('in_stock') === '1',
    sort:          (sp.get('sort') as SortKey) || 'recommended',
    query:         sp.get('q') ?? undefined,
    page:          sp.get('page') ? Number(sp.get('page')) : 1,
  }
}
