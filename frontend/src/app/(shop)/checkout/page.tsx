// Checkout — /checkout
// Server Component shell
import type { Metadata } from 'next'
import CheckoutPanels from '@/components/checkout/CheckoutPanels'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your ODSArts order. Handcrafted frames delivered to your door.',
}

export default function CheckoutPage() {
  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">

        {/* Page heading */}
        <div className="mb-10 md:mb-14">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold mb-2">
            Final Step
          </p>
          <h1 className="font-display text-[clamp(32px,4vw,56px)] text-obsidian leading-tight">
            Complete Your Order
          </h1>
          <div className="h-[1px] w-12 bg-gold/50 mt-4" />
        </div>

        {/* Two-column: form left, summary right. The pair shares the placed-order
            snapshot, so the grid lives in a client wrapper. */}
        <CheckoutPanels />
      </div>
    </div>
  )
}
