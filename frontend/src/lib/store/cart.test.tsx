import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { CartProvider, useCart } from '@/lib/store/cart'
import { AuthProvider } from '@/lib/store/auth'
import type { Product, ProductVariant, FinishOption } from '@/lib/types/product'
import type { ArtProduct, ArtMaterialVariant } from '@/lib/types/art'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const variant: ProductVariant = {
  id: 'v1', sku: 'BOX-8X10', sizeLabel: '8" × 10"', dimensionsCm: '20 × 25 cm',
  basePricePaise: 899900, stockQty: 10, weightGrams: 950,
}

const finish: FinishOption = {
  id: 'natural-walnut', name: 'Natural Walnut', swatchHex: '#5C3A21', priceDeltaPaise: 0,
}

const product = {
  id: '1', slug: 'classic-box', collectionSlug: 'walnut', name: 'Classic Box',
  tagline: 'Deep grain.', description: 'A frame.', deliveryDays: 14, currency: 'INR',
  variants: [variant], finishOptions: [finish], images: [], careInstructions: [], materials: [],
} as Product

const artVariant: ArtMaterialVariant = {
  id: 'av1', sku: 'ART-C-8X10', material: 'canvas', sizeLabel: '8" × 10"',
  dimensionsCm: '20 × 25 cm', pricePaise: 249900, stockQty: 5, weightGrams: 400,
}

const artProduct = {
  id: 'a1', slug: 'folk-dance', categorySlug: 'cultural', name: 'Folk Dance',
  tagline: 'Colour.', description: 'Art.', artist: 'Studio', medium: 'Digital',
  deliveryDays: 7, currency: 'INR', materialVariants: [artVariant], images: [], tags: [],
} as ArtProduct

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

const renderCart = () => renderHook(() => useCart(), { wrapper })

beforeEach(() => {
  // Signed out unless a test says otherwise, so sync stays off by default.
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no network'))))
})

describe('cart store', () => {
  it('adds a frame with the finish delta folded into the unit price', async () => {
    const { result } = renderCart()

    act(() => {
      result.current.addItem(product, variant, { ...finish, priceDeltaPaise: 100000 }, 2)
    })

    await waitFor(() => expect(result.current.items).toHaveLength(1))

    const item = result.current.items[0]

    expect(item.itemType).toBe('frame')
    expect(item.quantity).toBe(2)
    expect(item.unitPricePaise).toBe(999900)
  })

  it('merges a repeat add of the same variant and finish', async () => {
    const { result } = renderCart()

    act(() => {
      result.current.addItem(product, variant, finish, 1)
      result.current.addItem(product, variant, finish, 2)
    })

    await waitFor(() => expect(result.current.items).toHaveLength(1))
    expect(result.current.items[0].quantity).toBe(3)
  })

  it('keeps the same variant in different finishes as separate lines', async () => {
    const { result } = renderCart()

    act(() => {
      result.current.addItem(product, variant, finish, 1)
      result.current.addItem(product, variant, { ...finish, id: 'dark-walnut' }, 1)
    })

    await waitFor(() => expect(result.current.items).toHaveLength(2))
  })

  it('holds frames and art in one cart', async () => {
    const { result } = renderCart()

    act(() => {
      result.current.addItem(product, variant, finish, 1)
      result.current.addArtItem(artProduct, artVariant, 1)
    })

    await waitFor(() => expect(result.current.items).toHaveLength(2))

    expect(result.current.items.map((i) => i.itemType).sort()).toEqual(['art', 'frame'])
  })

  it('totals the subtotal across mixed items', async () => {
    const { result } = renderCart()

    act(() => {
      result.current.addItem(product, variant, finish, 2) // 2 × 899900
      result.current.addArtItem(artProduct, artVariant, 1) // 1 × 249900
    })

    await waitFor(() => expect(result.current.items).toHaveLength(2))
    expect(result.current.subtotalPaise).toBe(899900 * 2 + 249900)
  })

  it('removes and clears', async () => {
    const { result } = renderCart()

    act(() => {
      result.current.addItem(product, variant, finish, 1)
    })
    await waitFor(() => expect(result.current.items).toHaveLength(1))

    const key = result.current.items[0].key
    act(() => result.current.removeItem(key))
    await waitFor(() => expect(result.current.items).toHaveLength(0))

    act(() => {
      result.current.addItem(product, variant, finish, 1)
    })
    await waitFor(() => expect(result.current.items).toHaveLength(1))

    act(() => result.current.clearCart())
    await waitFor(() => expect(result.current.items).toHaveLength(0))
  })

  it('survives a reload by restoring from localStorage', async () => {
    const first = renderCart()

    act(() => {
      first.result.current.addItem(product, variant, finish, 3)
    })
    await waitFor(() => expect(first.result.current.items).toHaveLength(1))

    first.unmount()

    // A fresh provider is what a page reload produces.
    const second = renderCart()

    await waitFor(() => expect(second.result.current.items).toHaveLength(1))
    expect(second.result.current.items[0].quantity).toBe(3)
  })

  it('ignores corrupt stored cart data rather than crashing', async () => {
    localStorage.setItem('odsarts_cart_v1', '{ not json')

    const { result } = renderCart()

    await waitFor(() => expect(result.current.items).toEqual([]))
  })
})
