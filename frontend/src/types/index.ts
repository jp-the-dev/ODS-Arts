// Core TypeScript types for ODSArts
// Reference: agents/11-implementation-roadmap.md → lib/types.ts

export interface Image {
  src: string
  alt: string
  width: number
  height: number
}

export interface Product {
  id: string
  slug: string
  name: string
  collection: string
  price: number
  dimensions: string
  material: string
  description: string
  images: Image[]
  featured: boolean
}

export interface Collection {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  coverImage: Image
  products?: Product[]
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  city: string
  productName?: string
  productSlug?: string
}

export interface CustomerStory {
  id: string
  image: Image
  customerName: string
  city: string
  frameName: string
}

export type InspirationStyle = 'minimal' | 'warm' | 'gallery'

export interface InspirationImage {
  id: string
  image: Image
  style: InspirationStyle
  frameSlug?: string
  frameName?: string
}

export interface ProcessStep {
  number: string
  title: string
  description: string
}

export type ButtonVariant = 'primary' | 'ghost' | 'text'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type TextAlign = 'left' | 'center' | 'right'
export type ContainerSize = 'text' | 'content' | 'wide' | 'full'

// ── Order types ──────────────────────────────────────────────────────────────
// API contract for POST /orders (Laravel backend)

export interface PlaceOrderRequest {
  customer: {
    fullName: string
    email: string
    phone: string
  }
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    country: 'IN'
  }
  items: Array<{
    productId: string
    productSlug: string
    variantId: string
    finishId: string | null
    quantity: number
    unitPricePaise: number
  }>
  subtotalPaise: number
  currency: 'INR'
  notes?: string
}

export interface PlaceOrderResponse {
  /** e.g. "ODS-AB12CD" — displayed on success screen */
  orderReference: string
  placedAt: string
  estimatedDeliveryDays: { min: number; max: number }
  contactEmail: string
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_production'
  | 'quality_check'
  | 'dispatched'
  | 'delivered'

// ── Custom Framing types ──────────────────────────────────────────────────────
// API contract for POST /custom-framing/quotes (Laravel backend)

export interface CustomFramingQuoteRequest {
  artworkProvided: boolean
  artworkFilename?: string
  size: {
    preset?: string       // e.g. '16x20' or 'custom'
    widthCm: number
    heightCm: number
    unit: 'cm' | 'in'
  }
  mat: {
    style: 'none' | 'single' | 'double' | 'museum'
    colour: string        // e.g. 'ivory'
    colourLabel: string   // e.g. 'Ivory'
    width: 'narrow' | 'standard' | 'wide'
  }
  frame: {
    material: 'walnut' | 'oak' | 'brass' | 'black'
    finish: string        // e.g. 'satin'
    profile: 'classic' | 'slim' | 'box' | 'ledge'
  }
  estimatedPriceFromPaise: number
  contact: {
    fullName: string
    email: string
    phone: string
    notes?: string
  }
}

export interface CustomFramingQuoteResponse {
  quoteReference: string          // e.g. "CFR-AB12CD"
  receivedAt: string              // ISO timestamp
  estimatedResponseHours: number  // e.g. 48
}

