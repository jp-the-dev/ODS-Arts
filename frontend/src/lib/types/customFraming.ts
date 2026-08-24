/**
 * ODSArts — Custom Framing Types
 *
 * API contract for POST /custom-framing/quotes (Laravel backend).
 */

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
