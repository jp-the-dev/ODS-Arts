'use client'

import Image from 'next/image'
import { useCart } from '@/lib/store/cart'
import { formatPrice } from '@/lib/types/product'
import type { ShippingCourier } from '@/lib/types/shipping'

interface Props {
  selectedCourier?: ShippingCourier | null
  shippingLoading?: boolean
}

export default function CheckoutOrderSummary({ selectedCourier, shippingLoading }: Props) {
  const { items, subtotalPaise, totalItems } = useCart()

  const shippingPaise = selectedCourier?.rate_paise ?? 0
  const totalPaise    = subtotalPaise + shippingPaise

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

        {/* Shipping row — dynamic */}
        <div className="flex justify-between items-center">
          <span className="font-body text-[11px] uppercase tracking-[0.15em] text-pewter">
            Shipping
          </span>
          {shippingLoading ? (
            <span className="h-3 w-16 bg-obsidian/8 rounded animate-pulse" />
          ) : selectedCourier ? (
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-body text-sm text-obsidian tabular-nums">
                {formatPrice(selectedCourier.rate_paise)}
              </span>
              <span className="font-body text-[10px] text-pewter/70">
                {selectedCourier.courier_name}
              </span>
            </div>
          ) : (
            <span className="font-body text-[11px] text-pewter italic">Enter pincode</span>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-obsidian/8" />

      {/* Grand total */}
      <div className="flex justify-between items-center">
        <span className="font-body text-[12px] uppercase tracking-[0.2em] text-obsidian">
          Total
        </span>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-display text-[22px] text-obsidian tabular-nums">
            {formatPrice(totalPaise)}
          </span>
          {selectedCourier && (
            <span className="font-body text-[10px] text-pewter/60">
              incl. shipping
            </span>
          )}
        </div>
      </div>

      {/* Delivery note */}
      <p className="font-body text-[11px] text-pewter border-t border-obsidian/8 pt-4">
        {selectedCourier
          ? `Delivery via ${selectedCourier.courier_name} — estimated ${selectedCourier.estimated_delivery_days} working days.`
          : 'Handcrafted to order — your pieces will be delivered within 7–14 working days.'
        }
      </p>
    </div>
  )
}
