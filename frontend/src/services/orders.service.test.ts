import { describe, it, expect } from 'vitest'
import { buildOrderRequest } from '@/services/orders.service'
import type { CartItem } from '@/lib/types/product'

const form = {
  fullName: 'Priya Mehta',
  email: 'priya@example.com',
  phone: '+91 9876543210',
  addressLine1: '12 Marine Drive',
  addressLine2: '',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400020',
  notes: '',
}

const frameItem = {
  itemType: 'frame',
  key: 'v1__natural-walnut',
  product: { id: '1', slug: 'classic-box', collectionSlug: 'walnut', name: 'Classic Box', currency: 'INR', images: [] },
  variant: { id: 'v1', sku: 'BOX-8X10', sizeLabel: '8" × 10"', dimensionsCm: '20 × 25 cm', basePricePaise: 899900, stockQty: 10, weightGrams: 950 },
  finish: { id: 'natural-walnut', name: 'Natural Walnut', swatchHex: '#5C3A21', priceDeltaPaise: 0 },
  quantity: 1,
  unitPricePaise: 899900,
} as unknown as CartItem

const artItem = {
  itemType: 'art',
  key: 'av1',
  artProduct: { id: 'a1', slug: 'folk-dance', name: 'Folk Dance' },
  artVariant: { id: 'av1', sku: 'ART-C', sizeLabel: '8" × 10"', material: 'canvas', pricePaise: 249900 },
  quantity: 2,
  unitPricePaise: 249900,
} as unknown as CartItem

describe('buildOrderRequest', () => {
  it('tags every line with its catalogue', () => {
    const request = buildOrderRequest(form, [frameItem, artItem], 1399700)

    // The two variant tables auto-increment independently, so id 1 exists in
    // both. Without itemType the server priced and shipped a frame for an art
    // order — this is the guard against that returning.
    expect(request.items.map((i) => i.itemType)).toEqual(['frame', 'art'])
  })

  it('sends the art variant id, not the art product id', () => {
    const request = buildOrderRequest(form, [artItem], 499800)

    expect(request.items[0].variantId).toBe('av1')
    expect(request.items[0].productId).toBe('a1')
    expect(request.items[0].finishId).toBeNull()
  })

  it('carries the frame finish through', () => {
    const request = buildOrderRequest(form, [frameItem], 899900)

    expect(request.items[0].finishId).toBe('natural-walnut')
    expect(request.items[0].variantId).toBe('v1')
  })

  it('maps the customer and address', () => {
    const request = buildOrderRequest(form, [frameItem], 899900)

    expect(request.customer).toEqual({
      fullName: 'Priya Mehta',
      email: 'priya@example.com',
      phone: '+91 9876543210',
    })
    expect(request.address.pincode).toBe('400020')
    expect(request.address.country).toBe('IN')
    // Empty optional fields are omitted rather than sent as ''.
    expect(request.address.line2).toBeUndefined()
    expect(request.notes).toBeUndefined()
  })

  it('preserves quantities and the declared subtotal', () => {
    const request = buildOrderRequest(form, [frameItem, artItem], 1399700)

    expect(request.items.map((i) => i.quantity)).toEqual([1, 2])
    expect(request.subtotalPaise).toBe(1399700)
    expect(request.currency).toBe('INR')
  })
})
