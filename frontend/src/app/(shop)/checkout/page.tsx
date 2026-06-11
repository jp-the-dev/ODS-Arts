// Checkout — /checkout
// Server Component shell
import type { Metadata } from 'next'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import CheckoutOrderSummary from '@/components/checkout/CheckoutOrderSummary'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your ODSArts order. Handcrafted frames delivered to your door.',
}

export default function CheckoutPage() {
  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <CheckoutForm />
      </div>
    </div>
  )
}
