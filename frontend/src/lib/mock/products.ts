/**
 * ODSArts — Mock Product Data
 *
 * Used when NEXT_PUBLIC_USE_MOCK_DATA=true.
 * 3 collections × 3 frame profiles each = 9 products total.
 * Data MUST conform exactly to `src/lib/types/product.ts`.
 */

import type { Product, FinishOption } from '@/lib/types/product'

// ── Shared finish options ───────────────────────────────────────────────────

const WALNUT_FINISHES: FinishOption[] = [
  { id: 'natural-walnut', name: 'Natural Walnut', swatchHex: '#5C3A21', priceDeltaPaise: 0 },
  { id: 'dark-walnut',    name: 'Dark Walnut',    swatchHex: '#2C1A0E', priceDeltaPaise: 100000 },
]

const GALLERY_FINISHES: FinishOption[] = [
  { id: 'matte-black',    name: 'Matte Black',    swatchHex: '#0E0D0B', priceDeltaPaise: 0 },
  { id: 'brushed-silver', name: 'Brushed Silver', swatchHex: '#A8A9AD', priceDeltaPaise: 150000 },
]

const HERITAGE_FINISHES: FinishOption[] = [
  { id: 'antique-gold', name: 'Antique Gold', swatchHex: '#C9A96E', priceDeltaPaise: 0 },
  { id: 'aged-silver',  name: 'Aged Silver',  swatchHex: '#B0B0B0', priceDeltaPaise: 200000 },
]

// ── Products ────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: Product[] = [

  // ══════════════ WALNUT SERIES (3 profiles) ══════════════

  {
    id: 'prod_walnut_classic', slug: 'walnut-classic', collectionSlug: 'walnut',
    name: 'Classic Walnut', tagline: 'Wide profile. Deep grain. Timeless.',
    description: 'The flagship of the Walnut Series. A wide, traditional profile cut from solid American walnut with a hand-rubbed oil finish that deepens over decades.',
    deliveryDays: 14, currency: 'INR', finishOptions: WALNUT_FINISHES,
    variants: [
      { id: 'wln-c-8x10',  sku: 'WLN-C-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise:  899900, stockQty: 12, weightGrams:  950 },
      { id: 'wln-c-11x14', sku: 'WLN-C-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise: 1299900, stockQty:  8, weightGrams: 1350 },
      { id: 'wln-c-16x20', sku: 'WLN-C-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 1899900, stockQty:  5, weightGrams: 1900 },
      { id: 'wln-c-20x24', sku: 'WLN-C-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 2499900, stockQty:  3, weightGrams: 2500 },
    ],
    images: [
      { url: '/images/collections/walnut.png', alt: 'Classic Walnut — front view', role: 'hero' },
      { url: '/images/craft/workshop.png',      alt: 'Walnut being crafted',        role: 'detail' },
      { url: '/images/lifestyle/1.png',          alt: 'Classic Walnut in home',      role: 'lifestyle' },
    ],
    careInstructions: ['Wipe with a soft dry cloth.', 'Re-oil annually with food-safe walnut oil.', 'Keep away from direct moisture.'],
    materials: ['Solid American Walnut', 'Museum-Grade Anti-Reflective Glass', 'Acid-Free Archival Matting'],
  },

  {
    id: 'prod_walnut_slim', slug: 'walnut-slim', collectionSlug: 'walnut',
    name: 'Slim Walnut', tagline: 'Modern restraint. Natural warmth.',
    description: 'A refined, narrow 12mm profile for contemporary spaces. All the warmth and grain character of solid walnut, barely there, perfectly present.',
    deliveryDays: 14, currency: 'INR', finishOptions: WALNUT_FINISHES,
    variants: [
      { id: 'wln-s-8x10',  sku: 'WLN-S-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise:  749900, stockQty: 15, weightGrams:  700 },
      { id: 'wln-s-11x14', sku: 'WLN-S-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise: 1099900, stockQty: 10, weightGrams: 1000 },
      { id: 'wln-s-16x20', sku: 'WLN-S-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 1599900, stockQty:  7, weightGrams: 1500 },
      { id: 'wln-s-20x24', sku: 'WLN-S-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 2099900, stockQty:  4, weightGrams: 2000 },
    ],
    images: [
      { url: '/images/collections/walnut.png', alt: 'Slim Walnut — front view', role: 'hero' },
      { url: '/images/craft/workshop.png',      alt: 'Slim Walnut detail',       role: 'detail' },
      { url: '/images/lifestyle/2.png',          alt: 'Slim Walnut on wall',      role: 'lifestyle' },
    ],
    careInstructions: ['Wipe with a soft dry cloth.', 'Avoid direct sunlight.', 'Polish lightly once a year.'],
    materials: ['Solid American Walnut (12mm face)', 'Museum-Grade Anti-Reflective Glass', 'Acid-Free Archival Matting'],
  },

  {
    id: 'prod_walnut_box', slug: 'walnut-box-float', collectionSlug: 'walnut',
    name: 'Box Float', tagline: 'The artwork breathes. The walnut anchors it.',
    description: 'A deep shadow-box profile that floats the artwork 10mm proud of the backing. Ideal for canvas prints, heirloom photos, and fine art.',
    deliveryDays: 18, currency: 'INR', finishOptions: WALNUT_FINISHES,
    variants: [
      { id: 'wln-b-8x10',  sku: 'WLN-B-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise: 1099900, stockQty:  8, weightGrams: 1100 },
      { id: 'wln-b-11x14', sku: 'WLN-B-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise: 1599900, stockQty:  6, weightGrams: 1600 },
      { id: 'wln-b-16x20', sku: 'WLN-B-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 2299900, stockQty:  4, weightGrams: 2200 },
      { id: 'wln-b-20x24', sku: 'WLN-B-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 2999900, stockQty:  2, weightGrams: 2900 },
    ],
    images: [
      { url: '/images/collections/walnut.png', alt: 'Box Float — front view', role: 'hero' },
      { url: '/images/craft/workshop.png',      alt: 'Box Float depth detail', role: 'detail' },
      { url: '/images/lifestyle/3.png',          alt: 'Box Float in home',     role: 'lifestyle' },
    ],
    careInstructions: ['Dust interior recess with a soft brush.', 'Wipe exterior with a lightly damp cloth.', 'Re-oil annually.'],
    materials: ['Solid American Walnut (40mm depth)', 'Open-face (no glass)', 'Acid-Free Archival Backing'],
  },

  // ══════════════ GALLERY SERIES (3 profiles) ══════════════

  {
    id: 'prod_gallery_classic', slug: 'gallery-classic', collectionSlug: 'gallery',
    name: 'Gallery Classic', tagline: 'Flat. Precise. Invisible.',
    description: 'A perfectly flat 5mm matte powder-coated aluminium profile. Disappears into the wall, lets the art command the room.',
    deliveryDays: 10, currency: 'INR', finishOptions: GALLERY_FINISHES,
    variants: [
      { id: 'gal-c-8x10',  sku: 'GAL-C-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise:  699900, stockQty: 20, weightGrams:  450 },
      { id: 'gal-c-11x14', sku: 'GAL-C-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise:  999900, stockQty: 15, weightGrams:  700 },
      { id: 'gal-c-16x20', sku: 'GAL-C-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 1499900, stockQty: 10, weightGrams: 1000 },
      { id: 'gal-c-20x24', sku: 'GAL-C-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 1999900, stockQty:  6, weightGrams: 1400 },
    ],
    images: [
      { url: '/images/collections/gallery.png', alt: 'Gallery Classic — front view', role: 'hero' },
      { url: '/images/craft/workshop.png',       alt: 'Aluminium frame detail',       role: 'detail' },
      { url: '/images/lifestyle/1.png',           alt: 'Gallery Classic in situ',     role: 'lifestyle' },
    ],
    careInstructions: ['Clean with a dry microfibre cloth.', 'No abrasive cleaners.', 'Avoid metal-on-metal contact.'],
    materials: ['Aerospace-Grade Aluminium', 'UV-Protective Acrylic', 'Floating Mount Spacers'],
  },

  {
    id: 'prod_gallery_float', slug: 'gallery-float', collectionSlug: 'gallery',
    name: 'Gallery Float', tagline: 'The art levitates. The frame holds space.',
    description: 'A deep 32mm box aluminium profile that floats canvas or acrylic artwork 8mm from the backing, creating a striking shadow against the wall.',
    deliveryDays: 12, currency: 'INR', finishOptions: GALLERY_FINISHES,
    variants: [
      { id: 'gal-f-8x10',  sku: 'GAL-F-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise:  849900, stockQty: 15, weightGrams:  600 },
      { id: 'gal-f-11x14', sku: 'GAL-F-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise: 1249900, stockQty: 10, weightGrams:  900 },
      { id: 'gal-f-16x20', sku: 'GAL-F-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 1799900, stockQty:  7, weightGrams: 1250 },
      { id: 'gal-f-20x24', sku: 'GAL-F-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 2399900, stockQty:  4, weightGrams: 1700 },
    ],
    images: [
      { url: '/images/collections/gallery.png', alt: 'Gallery Float — front view', role: 'hero' },
      { url: '/images/craft/workshop.png',       alt: 'Gallery Float depth',        role: 'detail' },
      { url: '/images/lifestyle/2.png',           alt: 'Gallery Float on wall',     role: 'lifestyle' },
    ],
    careInstructions: ['Wipe with a dry microfibre cloth.', 'Interior recess: use a soft brush.', 'Avoid humidity.'],
    materials: ['Aerospace-Grade Aluminium (32mm depth)', 'Open face — no glass', 'Foam-core archival backing'],
  },

  {
    id: 'prod_gallery_ledge', slug: 'gallery-ledge', collectionSlug: 'gallery',
    name: 'Gallery Ledge', tagline: 'Clip. Display. Rearrange.',
    description: 'A clip-style ledge frame allowing artwork swaps without tools. Designed for editorial walls that evolve — ideal for photographers and collectors.',
    deliveryDays: 8, currency: 'INR', finishOptions: GALLERY_FINISHES,
    variants: [
      { id: 'gal-l-8x10',  sku: 'GAL-L-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise:  549900, stockQty: 25, weightGrams:  300 },
      { id: 'gal-l-11x14', sku: 'GAL-L-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise:  799900, stockQty: 20, weightGrams:  480 },
      { id: 'gal-l-16x20', sku: 'GAL-L-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 1099900, stockQty: 12, weightGrams:  700 },
      { id: 'gal-l-20x24', sku: 'GAL-L-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 1499900, stockQty:  8, weightGrams:  950 },
    ],
    images: [
      { url: '/images/collections/gallery.png', alt: 'Gallery Ledge — front view', role: 'hero' },
      { url: '/images/craft/workshop.png',       alt: 'Ledge clip mechanism',       role: 'detail' },
      { url: '/images/lifestyle/3.png',           alt: 'Gallery Ledge on wall',     role: 'lifestyle' },
    ],
    careInstructions: ['Wipe with a dry microfibre cloth.', 'Clip mechanism is stainless — no rust.', 'No glass — open front.'],
    materials: ['Aerospace-Grade Aluminium', 'Stainless Steel Clip Mechanism', 'Open front — no glass'],
  },

  // ══════════════ HERITAGE COLLECTION (3 profiles) ══════════════

  {
    id: 'prod_heritage_grand', slug: 'heritage-grand', collectionSlug: 'heritage',
    name: 'Heritage Grand', tagline: 'The room will know.',
    description: 'The most commanding piece in our collection. An 80mm wide ornate profile, hand-gilded in 22k gold leaf using the same water-gilding technique used in the Louvre.',
    deliveryDays: 21, currency: 'INR', finishOptions: HERITAGE_FINISHES,
    variants: [
      { id: 'her-g-8x10',  sku: 'HER-G-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise: 1499900, stockQty:  5, weightGrams: 1600 },
      { id: 'her-g-11x14', sku: 'HER-G-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise: 2199900, stockQty:  4, weightGrams: 2200 },
      { id: 'her-g-16x20', sku: 'HER-G-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 3299900, stockQty:  2, weightGrams: 3200 },
      { id: 'her-g-20x24', sku: 'HER-G-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 4499900, stockQty:  2, weightGrams: 4100 },
    ],
    images: [
      { url: '/images/collections/heritage.png', alt: 'Heritage Grand — front view', role: 'hero' },
      { url: '/images/craft/workshop.png',        alt: 'Gold leaf gilding detail',    role: 'detail' },
      { url: '/images/lifestyle/1.png',            alt: 'Heritage Grand in study',    role: 'lifestyle' },
    ],
    careInstructions: ['Dust only with a natural-bristle brush.', 'Never use a cloth — it lifts gold leaf.', 'Professional cleaning every 5 years.'],
    materials: ['Hand-Gilded 22k Gold Leaf (80mm profile)', 'Archival Backing Board', '8-Ply Beveled Museum Matting'],
  },

  {
    id: 'prod_heritage_slim', slug: 'heritage-slim', collectionSlug: 'heritage',
    name: 'Heritage Slim', tagline: 'Restrained opulence. For the discerning eye.',
    description: 'A 40mm refined gilded profile for artwork that demands grandeur without overwhelming the wall. Ideal for heirloom photographs and botanical illustrations.',
    deliveryDays: 18, currency: 'INR', finishOptions: HERITAGE_FINISHES,
    variants: [
      { id: 'her-s-8x10',  sku: 'HER-S-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise:  999900, stockQty:  8, weightGrams: 1000 },
      { id: 'her-s-11x14', sku: 'HER-S-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise: 1499900, stockQty:  6, weightGrams: 1500 },
      { id: 'her-s-16x20', sku: 'HER-S-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 2199900, stockQty:  4, weightGrams: 2100 },
      { id: 'her-s-20x24', sku: 'HER-S-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 2999900, stockQty:  2, weightGrams: 2800 },
    ],
    images: [
      { url: '/images/collections/heritage.png', alt: 'Heritage Slim — front view', role: 'hero' },
      { url: '/images/craft/workshop.png',        alt: 'Heritage Slim gilding',      role: 'detail' },
      { url: '/images/lifestyle/2.png',            alt: 'Heritage Slim in home',     role: 'lifestyle' },
    ],
    careInstructions: ['Dust with a natural-bristle brush.', 'Avoid moisture and humidity.', 'No sprays near the frame.'],
    materials: ['Hand-Gilded 22k Gold Leaf (40mm profile)', 'Archival Backing Board', '4-Ply Beveled Museum Matting'],
  },

  {
    id: 'prod_heritage_noir', slug: 'heritage-noir', collectionSlug: 'heritage',
    name: 'Heritage Noir', tagline: 'Where grandeur meets shadow.',
    description: 'A hand-lacquered ebony profile with applied antique silver leaf in the relief channels. The darkest frame in our collection — designed for bold photography and contemporary oil paintings.',
    deliveryDays: 21, currency: 'INR', finishOptions: HERITAGE_FINISHES,
    variants: [
      { id: 'her-n-8x10',  sku: 'HER-N-8X10',  sizeLabel: '8" × 10"',  dimensionsCm: '20 × 25 cm', basePricePaise: 1299900, stockQty:  6, weightGrams: 1200 },
      { id: 'her-n-11x14', sku: 'HER-N-11X14', sizeLabel: '11" × 14"', dimensionsCm: '28 × 36 cm', basePricePaise: 1899900, stockQty:  4, weightGrams: 1800 },
      { id: 'her-n-16x20', sku: 'HER-N-16X20', sizeLabel: '16" × 20"', dimensionsCm: '41 × 51 cm', basePricePaise: 2799900, stockQty:  3, weightGrams: 2600 },
      { id: 'her-n-20x24', sku: 'HER-N-20X24', sizeLabel: '20" × 24"', dimensionsCm: '51 × 61 cm', basePricePaise: 3799900, stockQty:  2, weightGrams: 3400 },
    ],
    images: [
      { url: '/images/collections/heritage.png', alt: 'Heritage Noir — front view',  role: 'hero' },
      { url: '/images/craft/workshop.png',        alt: 'Lacquer and silver detail',   role: 'detail' },
      { url: '/images/lifestyle/3.png',            alt: 'Heritage Noir in room',      role: 'lifestyle' },
    ],
    careInstructions: ['Dust with a natural-bristle brush.', 'Lacquer can chip — handle with care.', 'Never wet-clean the frame.'],
    materials: ['Hand-Lacquered Ebony Finish', 'Antique Silver Leaf Accents', 'Archival Museum Backing'],
  },
]
