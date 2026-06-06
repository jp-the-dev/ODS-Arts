'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Product, ProductVariant, FinishOption } from '@/lib/types/product'
import { formatPrice } from '@/lib/types/product'
import { useCart } from '@/lib/store/cart'
import WishlistButton from '@/components/product/WishlistButton'

interface ProductConfiguratorProps {
  product: Product
}

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0])
  const defaultFinish: FinishOption = product.finishOptions[0] ?? { id: 'standard', name: 'Standard', swatchHex: '#000000', priceDeltaPaise: 0 }
  const [selectedFinish, setSelectedFinish]   = useState<FinishOption>(defaultFinish)
  const [quantity, setQuantity]               = useState(1)
  const [added, setAdded]                     = useState(false)
  const [openAccordion, setOpenAccordion]     = useState<string | null>(null)

  const unitPrice = selectedVariant.basePricePaise + selectedFinish.priceDeltaPaise
  const inStock   = selectedVariant.stockQty > 0
  const lowStock  = inStock && selectedVariant.stockQty <= 3

  function handleAddToCart() {
    addItem(product, selectedVariant, selectedFinish, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function toggleAccordion(key: string) {
    setOpenAccordion(prev => (prev === key ? null : key))
  }

  const accordions: { key: string; label: string; content: React.ReactNode }[] = [
    {
      key: 'materials',
      label: 'Materials',
      content: (
        <ul className="flex flex-col gap-3 pt-2 pb-4">
          {product.materials.map((m, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
              <span className="font-body text-sm text-pewter-dark">{m}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'dimensions',
      label: 'Dimensions & Weight',
      content: (
        <div className="pt-2 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {product.variants.map((v) => (
              <div key={v.id} className="flex justify-between font-body text-sm text-pewter-dark">
                <span>{v.sizeLabel}</span>
                <span className="text-pewter">{v.dimensionsCm}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'care',
      label: 'Care Instructions',
      content: (
        <ul className="flex flex-col gap-3 pt-2 pb-4">
          {product.careInstructions.map((c, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0 mt-2" />
              <span className="font-body text-sm text-pewter-dark">{c}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* ── Title & price ── */}
      <div>
        <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold">
          {product.collectionSlug === 'walnut' ? 'Signature Wood'
            : product.collectionSlug === 'gallery' ? 'Minimalist Architecture'
            : 'Vintage Opulence'}
        </span>
        <h1 className="font-display text-[clamp(28px,3vw,42px)] leading-[1.1] tracking-tight text-obsidian mt-2 mb-1">
          {product.name}
        </h1>
        <p className="font-body text-sm text-pewter italic">{product.tagline}</p>

        {/* Live price */}
        <div className="mt-6 flex items-baseline gap-3">
          <motion.span
            key={unitPrice}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-[clamp(24px,2.5vw,34px)] text-obsidian"
          >
            {formatPrice(unitPrice)}
          </motion.span>
          {selectedFinish.priceDeltaPaise > 0 && (
            <span className="font-body text-xs text-pewter">
              includes {formatPrice(selectedFinish.priceDeltaPaise)} finish premium
            </span>
          )}
        </div>
      </div>

      {/* ── Size selector ── */}
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-obsidian mb-3">
          Size — <span className="text-pewter">{selectedVariant.sizeLabel} ({selectedVariant.dimensionsCm})</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              className={`py-3 px-4 text-left border transition-all duration-200 focus:outline-none ${
                selectedVariant.id === variant.id
                  ? 'border-obsidian bg-obsidian text-ivory'
                  : 'border-obsidian/20 text-pewter-dark hover:border-obsidian/60'
              }`}
            >
              <span className="font-body text-[13px]">{variant.sizeLabel}</span>
              <br />
              <span className="font-body text-[11px] opacity-60">{formatPrice(variant.basePricePaise + selectedFinish.priceDeltaPaise)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Finish swatch picker ── */}
      {product.finishOptions.length > 1 && (
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-obsidian mb-3">
            Finish — <span className="text-pewter">{selectedFinish.name}</span>
          </p>
          <div className="flex gap-3">
            {product.finishOptions.map((finish) => (
              <button
                key={finish.id}
                onClick={() => setSelectedFinish(finish)}
                title={finish.name}
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 focus:outline-none ${
                  selectedFinish.id === finish.id
                    ? 'border-obsidian ring-2 ring-offset-2 ring-obsidian/30 scale-110'
                    : 'border-transparent hover:border-obsidian/40'
                }`}
                style={{ backgroundColor: finish.swatchHex }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Quantity stepper ── */}
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-obsidian mb-3">Quantity</p>
        <div className="flex items-center gap-0 border border-obsidian/20 w-fit">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-11 h-11 flex items-center justify-center text-obsidian hover:bg-obsidian/5 transition-colors font-body text-lg focus:outline-none"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-12 text-center font-body text-sm text-obsidian tabular-nums">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(q => Math.min(selectedVariant.stockQty, q + 1))}
            className="w-11 h-11 flex items-center justify-center text-obsidian hover:bg-obsidian/5 transition-colors font-body text-lg focus:outline-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <p className="mt-2 font-body text-[11px] text-pewter">
          {lowStock
            ? `Only ${selectedVariant.stockQty} left in stock`
            : !inStock
            ? 'Out of stock — contact us for lead times'
            : `${selectedVariant.stockQty} available`}
        </p>
      </div>

      {/* ── Add to cart CTA ── */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        disabled={!inStock}
        className={`w-full py-5 font-body text-[11px] uppercase tracking-[0.22em] transition-all duration-500 focus:outline-none ${
          added
            ? 'bg-walnut text-ivory'
            : inStock
            ? 'bg-obsidian text-ivory hover:bg-walnut'
            : 'bg-obsidian/30 text-ivory/50 cursor-not-allowed'
        }`}
      >
        {added ? '✓ Added to Cart' : inStock ? 'Add to Cart' : 'Out of Stock'}
      </motion.button>

      {/* ── Wishlist ── */}
      <div className="flex justify-center">
        <WishlistButton product={product} variant="full" />
      </div>

      {/* ── Trust badges ── */}
      <div className="flex flex-col gap-2 border-t border-obsidian/8 pt-6">
        {[
          `Handcrafted to Order — ${product.deliveryDays} day delivery`,
          'Museum-Grade Materials. Archival Standard.',
          'Free 30-Day Returns on All Orders',
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
            <span className="font-body text-[12px] text-pewter-dark">{badge}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 mt-1">
          <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
          <Link href="/custom-framing" className="font-body text-[12px] text-gold underline underline-offset-2 hover:text-gold-dark transition-colors">
            Need a custom size? Start a commission →
          </Link>
        </div>
      </div>

      {/* ── Accordion details ── */}
      <div className="flex flex-col border-t border-obsidian/8">
        {accordions.map(({ key, label, content }) => (
          <div key={key} className="border-b border-obsidian/8">
            <button
              onClick={() => toggleAccordion(key)}
              className="flex items-center justify-between w-full py-4 text-left focus:outline-none"
            >
              <span className="font-body text-[12px] uppercase tracking-[0.2em] text-obsidian">{label}</span>
              <span className="font-body text-lg text-pewter transition-transform duration-300" style={{ transform: openAccordion === key ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                +
              </span>
            </button>
            {openAccordion === key && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {content}
              </motion.div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
