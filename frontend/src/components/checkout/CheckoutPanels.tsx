'use client'

import { useState } from 'react'
import CheckoutForm from './CheckoutForm'
import CheckoutOrderSummary from './CheckoutOrderSummary'
import type { CartItem } from '@/lib/types/product'

/** What was bought, frozen at the moment the order was placed. */
export interface PlacedOrderSnapshot {
  items: CartItem[]
  subtotalPaise: number
  totalItems: number
}

/**
 * Owns the state the two checkout columns share.
 *
 * The form and the summary are siblings, and placing an order clears the cart —
 * so the summary needs to hear about it, otherwise it keeps rendering live cart
 * state and shows ₹0 beside "Your order is confirmed". The page itself stays a
 * Server Component so it can still export `metadata`, which is why this wrapper
 * exists rather than making the page a client component.
 */
export default function CheckoutPanels() {
  const [placed, setPlaced] = useState<PlacedOrderSnapshot | null>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16 items-start">
      <CheckoutForm onPlaced={setPlaced} />
      <CheckoutOrderSummary placed={placed} />
    </div>
  )
}
