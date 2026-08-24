/**
 * ODSArts — Order Types
 *
 * API contract for POST /orders (Laravel backend).
 */

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
    /**
     * Which catalogue the line came from. Frames and art have separate variant
     * tables with independent ids, so the backend cannot infer this from
     * `variantId` alone — omitting it would risk pricing the wrong item.
     */
    itemType: 'frame' | 'art'
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
