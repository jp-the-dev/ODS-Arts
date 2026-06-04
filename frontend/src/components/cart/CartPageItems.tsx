'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/store/cart'
import { formatPrice } from '@/lib/types/product'

export default function CartPageItems() {
  const { items, removeItem, updateQty, totalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        {/* Empty cart icon */}
        <div className="w-20 h-20 rounded-full bg-ivory-200 flex items-center justify-center mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-pewter"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h2 className="font-display text-[clamp(24px,2.5vw,36px)] text-obsidian mb-3">
          Your cart awaits a story.
        </h2>
        <p className="font-body text-sm text-pewter mb-8 max-w-xs">
          You haven&apos;t added any frames yet. Explore our collections to find the perfect one.
        </p>
        <Link
          href="/collections"
          className="inline-flex items-center gap-3 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 hover:bg-walnut transition-colors duration-500"
        >
          Browse Collections
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="opacity-60">
            <path
              d="M1 7h12M8 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[clamp(28px,3vw,42px)] text-obsidian tracking-tight">
          Your Selection
        </h1>
        <span className="font-body text-[11px] uppercase tracking-[0.2em] text-pewter">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Gold rule */}
      <div className="h-[1px] bg-gold/30 mb-0" />

      {/* Item list */}
      <ul className="divide-y divide-obsidian/8">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const heroImg =
              item.product.images.find((i) => i.role === 'hero') ?? item.product.images[0]

            return (
              <motion.li
                key={item.key}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, paddingTop: 0, paddingBottom: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
                className="flex gap-5 md:gap-8 py-7"
              >
                {/* Thumbnail */}
                <Link
                  href={`/collections/${item.product.collectionSlug}`}
                  className="relative flex-shrink-0 w-24 h-28 md:w-32 md:h-40 bg-ivory-200 overflow-hidden group"
                >
                  {heroImg && (
                    <Image
                      src={heroImg.url}
                      alt={heroImg.alt}
                      fill
                      sizes="(max-width: 768px) 96px, 128px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  {/* Top: name + remove */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-body text-[10px] uppercase tracking-[0.25em] text-gold mb-1.5">
                        {item.product.collectionSlug === 'walnut'
                          ? 'Signature Wood'
                          : item.product.collectionSlug === 'gallery'
                          ? 'Minimalist Architecture'
                          : 'Vintage Opulence'}
                      </p>
                      <h3 className="font-display text-[clamp(18px,1.8vw,24px)] text-obsidian leading-snug">
                        {item.product.name}
                      </h3>
                      <p className="font-body text-[12px] text-pewter mt-1">
                        {item.variant.sizeLabel} &middot; {item.finish.name}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="flex-shrink-0 mt-0.5 p-1 text-pewter hover:text-obsidian transition-colors focus:outline-none group"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="transition-transform duration-200 group-hover:rotate-90"
                      >
                        <path
                          d="M1 1L13 13M13 1L1 13"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Bottom: qty + price */}
                  <div className="flex items-center justify-between mt-4">
                    {/* Qty stepper */}
                    <div className="flex items-center border border-obsidian/15">
                      <button
                        onClick={() => updateQty(item.key, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-obsidian hover:bg-obsidian/5 focus:outline-none font-body text-base transition-colors"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-9 text-center font-body text-sm text-obsidian tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.key, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-obsidian hover:bg-obsidian/5 focus:outline-none font-body text-base transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Unit price */}
                    <span className="font-display text-[clamp(18px,1.6vw,22px)] text-obsidian">
                      {formatPrice(item.unitPricePaise * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
