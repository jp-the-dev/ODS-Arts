import type { Metadata } from 'next'
import Link from 'next/link'
import OrderTracking from '@/components/orders/OrderTracking'

export const metadata: Metadata = {
  title: 'Track Your Order | ODSArts',
  description: 'Follow your ODSArts order from our studio to your wall.',
  // Order references are private to the customer holding them.
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ orderNumber: string }>
}

/**
 * Order tracking — /orders/{reference}
 *
 * Open to guests holding the reference, since checkout does not require an
 * account; the API scopes owned orders to their owner. Tracking is fetched
 * client-side so the same page serves both.
 */
export default async function OrderTrackingPage({ params }: Props) {
  const { orderNumber } = await params

  return (
    <main className="bg-ivory min-h-screen px-6 md:px-10 pt-32 pb-24">
      <div className="max-w-3xl mx-auto w-full">
        <nav className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.18em] text-pewter mb-10">
          <Link href="/account" className="hover:text-obsidian transition-colors">
            Account
          </Link>
          <span>/</span>
          <span className="text-obsidian">Order</span>
        </nav>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] w-10 bg-gold/40" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
            Tracking
          </span>
        </div>

        <h1 className="font-display text-[clamp(30px,4vw,48px)] text-obsidian leading-tight mb-10">
          Where your order is.
        </h1>

        <OrderTracking orderNumber={orderNumber} />
      </div>
    </main>
  )
}
