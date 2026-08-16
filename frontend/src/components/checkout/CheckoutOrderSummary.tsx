'use client'

import Image from 'next/image'
import { useCart } from '@/lib/store/cart'
import { formatPrice } from '@/lib/types/product'
import type { PlacedOrderSnapshot } from './CheckoutPanels'

interface Props {
  /**
   * What was bought, captured the moment the order was placed.
   *
   * Placing an order clears the cart, so reading live cart state here after
   * checkout succeeds renders "Subtotal (0 items) ₹0" next to a confirmation —
   * the basket is empty by then. When this is set it is the receipt, and the
   * live cart is no longer the right source.
   */
  placed?: PlacedOrderSnapshot | null
}

export default function CheckoutOrderSummary({ placed }: Props) {
  const cart = useCart()

  const items          = placed?.items ?? cart.items
  const subtotalPaise  = placed?.subtotalPaise ?? cart.subtotalPaise
  const totalItems     = placed?.totalItems ?? cart.totalItems

  return (
    <div className="bg-ivory-200/60 border border-obsidian/8 p-7 flex flex-col gap-5 sticky top-24">
      {/* Heading */}
      <div>
        <h2 className="font-display text-xl text-obsidian">Your Order</h2>
        <div className="h-[1px] bg-gold/40 mt-3" />
      </div>

      {/* Items (read-only) */}
      <ul className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => {
          const isArt   = item.itemType === 'art'
          const images  = isArt ? item.artProduct.images : item.product.images
          const heroImg = images.find((i) => i.role === 'hero') ?? images[0]
          const name    = isArt ? item.artProduct.name : item.product.name
          const sub     = isArt
            ? `${item.artVariant.sizeLabel} · ${item.artVariant.material.replace('-', ' ')}`
            : `${item.variant.sizeLabel} · ${item.finish.name}`
          return (
            <li key={item.key} className="flex gap-3">
              {/* Thumbnail */}
              <div className="relative w-14 h-14 flex-shrink-0 bg-ivory-300 overflow-hidden">
                {heroImg && (
                  <Image src={heroImg.url} alt={heroImg.alt} fill sizes="56px" className="object-cover" />
                )}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-obsidian text-ivory font-body text-[9px] flex items-center justify-center tabular-nums">
                  {item.quantity}
                </span>
              </div>
              {/* Info */}
              <div className="flex-1 flex flex-col justify-center gap-0.5">
                <p className="font-display text-[15px] text-obsidian leading-snug">{name}</p>
                <p className="font-body text-[11px] text-pewter">{sub}</p>
              </div>
              {/* Price */}
              <p className="font-body text-sm text-obsidian tabular-nums flex-shrink-0">
                {formatPrice(item.unitPricePaise * item.quantity)}
              </p>
            </li>
          )
        })}
      </ul>

      {/* Divider */}
      <div className="h-[1px] bg-obsidian/8" />

      {/* Totals */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="font-body text-[11px] uppercase tracking-[0.15em] text-pewter">
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
          <span className="font-body text-sm text-obsidian tabular-nums">
            {formatPrice(subtotalPaise)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-body text-[11px] uppercase tracking-[0.15em] text-pewter">
            Shipping
          </span>
          <span className="font-body text-[11px] text-pewter italic">TBD</span>
        </div>
      </div>

      <div className="h-[1px] bg-obsidian/8" />

      <div className="flex justify-between">
        <span className="font-body text-[12px] uppercase tracking-[0.2em] text-obsidian">
          Total
        </span>
        <span className="font-display text-[22px] text-obsidian tabular-nums">
          {formatPrice(subtotalPaise)}
        </span>
      </div>

      {/* Delivery note */}
      <p className="font-body text-[11px] text-pewter border-t border-obsidian/8 pt-4">
        Handcrafted to order — your pieces will be delivered within 7–14 working days.
      </p>
    </div>
  )
}
