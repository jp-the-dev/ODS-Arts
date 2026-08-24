/**
 * ODSArts — Art Product Types
 *
 * Completely separate from the Frame `Product` type.
 * Art has material+size as the pricing axis — no "finish" concept.
 * All prices in paise (1 INR = 100 paise).
 */

// ── Art Categories ─────────────────────────────────────────────────────────────

export type ArtStyle =
  | 'cultural'
  | 'modern'
  | 'business'
  | 'nature'
  | 'entertainment'
  | 'automotive'

// ── Print Materials ────────────────────────────────────────────────────────────

export type PrintMaterial =
  | 'canvas'       // Canvas Print — premium textured
  | 'photo-paper'  // Photo Paper Print — vivid, glossy/satin
  | 'foam-board'   // Foam Sheet / Foam Board — lightweight display
  | 'metallic'     // Metallic Paper Print — shimmer effect
  | 'fine-art'     // Fine Art Paper (Giclée) — archival museum-grade

export interface PrintMaterialMeta {
  id: PrintMaterial
  label: string              // "Canvas Print"
  shortLabel: string         // "Canvas"
  description: string        // "Museum-grade giclée on 310gsm cotton rag"
  /** Rough finish feel for the UI description */
  finish: string             // "Textured matte" | "Satin sheen" | "Glossy metallic"
  /** Hex swatch for the material selector tab */
  swatchHex: string
  /** True if this material is considered archival/premium */
  archival: boolean
}

export const PRINT_MATERIALS: PrintMaterialMeta[] = [
  {
    id: 'canvas',
    label: 'Canvas Print',
    shortLabel: 'Canvas',
    description: 'Hand-stretched on 450gsm artist-grade cotton canvas with UV-resistant inks.',
    finish: 'Textured matte',
    swatchHex: '#E8D5B7',
    archival: true,
  },
  {
    id: 'fine-art',
    label: 'Fine Art Paper',
    shortLabel: 'Fine Art',
    description: 'Giclée on 310gsm acid-free cotton rag — the museum standard for archival prints.',
    finish: 'Soft matte',
    swatchHex: '#F5F0E8',
    archival: true,
  },
  {
    id: 'metallic',
    label: 'Metallic Paper',
    shortLabel: 'Metallic',
    description: 'Printed on Fuji Crystal Archive metallic paper for a luminous, three-dimensional effect.',
    finish: 'Glossy metallic shimmer',
    swatchHex: '#C8C8C8',
    archival: false,
  },
  {
    id: 'photo-paper',
    label: 'Photo Paper',
    shortLabel: 'Photo',
    description: 'Pro-grade satin photo paper — vivid colour accuracy, subtle sheen, no glare.',
    finish: 'Satin semi-gloss',
    swatchHex: '#D4CFC8',
    archival: false,
  },
  {
    id: 'foam-board',
    label: 'Foam Board',
    shortLabel: 'Foam',
    description: 'Lightweight 5mm foam board — ideal for temporary displays, exhibitions, and studios.',
    finish: 'Matte flat',
    swatchHex: '#B8B0A8',
    archival: false,
  },
]

// ── Art Material Variant (one orderable SKU) ───────────────────────────────────

export interface ArtMaterialVariant {
  id: string
  sku: string
  material: PrintMaterial
  sizeLabel: string        // '8" × 10"'
  dimensionsCm: string     // '20 × 25 cm'
  /** Full price for this size + material combo in paise */
  pricePaise: number
  stockQty: number
  weightGrams: number
}

// ── Art Product ───────────────────────────────────────────────────────────────

export interface ArtProduct {
  id: string
  slug: string
  categorySlug: ArtStyle
  name: string
  tagline: string
  description: string
  /** "ODSArts Studio" for in-house, or real artist name */
  artist: string
  /** e.g. "Digital illustration", "Oil on canvas", "Photography" */
  medium: string
  deliveryDays: number
  currency: 'INR'
  /** All available material+size combos for this artwork */
  materialVariants: ArtMaterialVariant[]
  images: {
    url: string
    alt: string
    role: 'hero' | 'detail' | 'lifestyle'
  }[]
  /** Searchable tags: ["india", "heritage", "architecture"] */
  tags: string[]
}

// ── Art Helpers ───────────────────────────────────────────────────────────────

/**
 * Lowest price across all material+size combos for a given art product.
 *
 * Sold-out variants are excluded — a print must never advertise "from ₹799"
 * for a foam-board size that cannot actually be bought. If every variant is
 * out of stock the cheapest one is still returned so the card can show a
 * price beside its "sold out" state.
 */
export function artLowestPrice(art: ArtProduct): number {
  const inStock = art.materialVariants.filter((v) => v.stockQty > 0)
  const source = inStock.length > 0 ? inStock : art.materialVariants
  if (source.length === 0) return 0
  return Math.min(...source.map((v) => v.pricePaise))
}

/** Get all unique materials available for a product */
export function artMaterials(art: ArtProduct): PrintMaterial[] {
  return [...new Set(art.materialVariants.map((v) => v.material))]
}

/** Get all sizes available for a specific material */
export function artSizesForMaterial(art: ArtProduct, material: PrintMaterial): ArtMaterialVariant[] {
  return art.materialVariants.filter((v) => v.material === material)
}

// ── Art Cart Item ─────────────────────────────────────────────────────────────

export interface ArtCartItem {
  key: string
  itemType: 'art'
  artProduct: Pick<ArtProduct, 'id' | 'slug' | 'categorySlug' | 'name' | 'currency' | 'images'>
  artVariant: ArtMaterialVariant
  quantity: number
  /** Price in paise for one unit */
  unitPricePaise: number
}

// ── API Response Shapes ────────────────────────────────────────────────────────

/** GET /art/categories/:slug/products */
export type GetArtResponse = ArtProduct[]
