'use client'

import Link from 'next/link'
import { useCart } from '@/lib/store/cart'
import { formatPrice } from '@/lib/types/product'

export default function CartOrderSummary() {
  const { items, subtotalPaise, totalItems } = useCart()

  const hasItems = items.length > 0

  // Estimate delivery range (7–14 days based on mock data)
  const deliveryNote = 'Handcrafted to order · 7–14 working days'

  return (
    <div className="bg-ivory-200/60 border border-obsidian/8 p-7 flex flex-col gap-6 sticky top-24">
      {/* Heading */}
      <div>
        <h2 className="font-display text-[clamp(20px,2vw,28px)] text-obsidian">
          Order Summary
        </h2>
        <div className="h-[1px] bg-gold/40 mt-3" />
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-body text-[12px] uppercase tracking-[0.15em] text-pewter">
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
          <span className="font-body text-sm text-obsidian tabular-nums">
            {formatPrice(subtotalPaise)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-[12px] uppercase tracking-[0.15em] text-pewter">
            Shipping
          </span>
          <span className="font-body text-[12px] text-pewter italic">
            Calculated at checkout
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-[12px] uppercase tracking-[0.15em] text-pewter">
            Tax (GST)
          </span>
          <span className="font-body text-[12px] text-pewter italic">
            Included
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-obsidian/8" />

      {/* Total */}
      <div className="flex items-baseline justify-between">
        <span className="font-body text-[12px] uppercase tracking-[0.2em] text-obsidian">
          Estimated Total
        </span>
        <span className="font-display text-[clamp(22px,2vw,30px)] text-obsidian tabular-nums">
          {formatPrice(subtotalPaise)}
        </span>
      </div>

      {/* CTA */}
      {hasItems ? (
        <Link
          href="/checkout"
          className="w-full py-5 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-3 hover:bg-walnut transition-colors duration-500 group"
        >
          Proceed to Checkout
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            className="opacity-60 transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path
              d="M1 7h12M8 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      ) : (
        <Link
          href="/collections"
          className="w-full py-5 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-3 hover:bg-walnut transition-colors duration-500"
        >
          Explore Collections
        </Link>
      )}

      {/* Trust badges */}
      <div className="flex flex-col gap-2.5 border-t border-obsidian/8 pt-5">
        {[
          deliveryNote,
          'Museum-Grade Materials · Archival Standard',
          'Free 30-Day Returns on All Orders',
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
            <span className="font-body text-[11px] text-pewter-dark">{badge}</span>
          </div>
        ))}

        {/* SSL note */}
        <div className="flex items-center gap-2 mt-1">
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="flex-shrink-0 text-pewter">
            <path
              d="M5 1L1 2.8v3.2C1 8.4 2.8 10.6 5 11.2 7.2 10.6 9 8.4 9 6V2.8L5 1z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-body text-[10px] text-pewter/70 uppercase tracking-[0.15em]">
            256-bit SSL · Secure Checkout
          </span>
        </div>
      </div>
    </div>
  )
}
