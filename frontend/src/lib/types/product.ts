/**
 * ODSArts — Product Types
 *
 * These types define the exact API contract between the frontend and the
 * Laravel backend. The mock data layer MUST conform to these types so that
 * swapping mocks for real API calls requires zero UI changes.
 */

// ── Image ─────────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string
  alt: string
  /** 'hero' | 'detail' | 'back' | 'lifestyle' */
  role: 'hero' | 'detail' | 'back' | 'lifestyle'
}

// ── Finish / Variant ──────────────────────────────────────────────────────────

export interface FinishOption {
  id: string
  name: string
  /** Hex colour used for the swatch circle in the UI */
  swatchHex: string
  /** Extra price delta in paise vs the base price (can be 0) */
  priceDeltaPaise: number
}

// ── Size Variant (a single orderable SKU) ─────────────────────────────────────

export interface ProductVariant {
  id: string
  sku: string
  sizeLabel: string        // e.g.  '8" × 10"'
  dimensionsCm: string     // e.g.  '20 × 25 cm'
  /** Base price in paise (1 INR = 100 paise). Finish delta added on top. */
  basePricePaise: number
  stockQty: number
  /** Weight in grams, for shipping estimates */
  weightGrams: number
}

// ── Full Product (one frame in one collection) ─────────────────────────────────

export interface Product {
  id: string
  slug: string
  collectionSlug: string
  name: string
  tagline: string
  description: string
  /** Estimated delivery time in working days */
  deliveryDays: number
  currency: 'INR'
  variants: ProductVariant[]
  finishOptions: FinishOption[]
  images: ProductImage[]
  careInstructions: string[]
  materials: string[]
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Client-side unique key: `${variant.id}__${finish.id}` */
  key: string
  product: Pick<Product, 'id' | 'slug' | 'collectionSlug' | 'name' | 'currency' | 'images'>
  variant: ProductVariant
  finish: FinishOption
  quantity: number
  /** Unit price in paise (variant.basePricePaise + finish.priceDeltaPaise) */
  unitPricePaise: number
}

// ── API Response Shapes ────────────────────────────────────────────────────────

/** GET /collections/:slug/products */
export type GetProductsResponse = Product[]

/** POST /cart/items  →  returns the full updated cart */
export interface CartResponse {
  items: CartItem[]
  subtotalPaise: number
  currency: 'INR'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert paise to a formatted INR string, e.g. 1299900 → "₹12,999" */
export function formatPrice(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100)
}
