// Cart — /cart
// Server Component shell — reads nothing server-side (all cart state is client-side)
import type { Metadata } from 'next'
import CartPageItems from '@/components/cart/CartPageItems'
import CartOrderSummary from '@/components/cart/CartOrderSummary'

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'Review your selected frames before checkout.',
}

export default function CartPage() {
  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Two-column layout: items left, summary right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16 items-start">
          {/* Left — Item list */}
          <CartPageItems />

          {/* Right — Order summary (sticky) */}
          <CartOrderSummary />
        </div>
      </div>
    </div>
  )
}
