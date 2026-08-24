/**
 * ODSArts — Order Service
 *
 * Follows the same pattern as collections.service.ts and products.service.ts.
 *
 * MOCK mode (default — no backend yet):
 *   Simulates a network delay and returns a generated order reference.
 *   Activated when NEXT_PUBLIC_USE_MOCK_DATA is not explicitly 'false'.
 *
 * REAL mode (when Laravel backend is ready):
 *   Set NEXT_PUBLIC_USE_MOCK_DATA=false in .env.local.
 *   All calls automatically route to POST /orders via apiFetch().
 *   Zero other code changes needed.
 */

import { apiFetch } from '@/lib/api/client'
import { authHeaders } from '@/lib/store/auth'
import type {
  PlaceOrderRequest,
  PlaceOrderResponse,
} from '@/lib/types/order'
import type { CartItem } from '@/lib/types/product'

// `POST /orders` is not implemented on the Laravel side yet, so checkout stays on
// the mock order flow even when NEXT_PUBLIC_USE_MOCK_DATA=false takes the rest of
// the app live. Flip NEXT_PUBLIC_ORDERS_API_READY=true once the endpoint ships.
const USE_MOCK = process.env.NEXT_PUBLIC_ORDERS_API_READY !== 'true'

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateMockRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'ODS-'
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

/** Transforms CheckoutForm state + CartItems into a PlaceOrderRequest */
export function buildOrderRequest(
  form: {
    fullName: string
    email: string
    phone: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
    notes: string
  },
  items: CartItem[],
  subtotalPaise: number
): PlaceOrderRequest {
  return {
    customer: {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
    },
    address: {
      line1: form.addressLine1,
      line2: form.addressLine2 || undefined,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: 'IN',
    },
    items: items.map((item) => {
      if (item.itemType === 'art') {
        return {
          itemType:       'art' as const,
          productId:      item.artProduct.id,
          productSlug:    item.artProduct.slug,
          variantId:      item.artVariant.id,
          finishId:       null,
          quantity:       item.quantity,
          unitPricePaise: item.unitPricePaise,
        }
      }
      return {
        itemType:       'frame' as const,
        productId:      item.product.id,
        productSlug:    item.product.slug,
        variantId:      item.variant.id,
        finishId:       item.finish.id,
        quantity:       item.quantity,
        unitPricePaise: item.unitPricePaise,
      }
    }),
    subtotalPaise,
    currency: 'INR',
    notes: form.notes || undefined,
  }
}

// ── POST /orders ──────────────────────────────────────────────────────────────

export async function placeOrder(
  request: PlaceOrderRequest
): Promise<PlaceOrderResponse> {
  if (USE_MOCK) {
    // Simulate network latency so behaviour matches real usage
    await new Promise((r) => setTimeout(r, 1200))
    return {
      orderReference: generateMockRef(),
      placedAt: new Date().toISOString(),
      estimatedDeliveryDays: { min: 7, max: 14 },
      contactEmail: 'hello@odsarts.in',
    }
  }

  // Real API — activates when NEXT_PUBLIC_USE_MOCK_DATA=false
  return apiFetch<PlaceOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(request),
    revalidate: false, // POST — never cache
    // Checkout requires an account: the route is behind auth:sanctum and every
    // order is attached to the customer who placed it.
    headers: authHeaders(),
  })
}
