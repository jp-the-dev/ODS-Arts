'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ArtProduct, PrintMaterial, ArtMaterialVariant } from '@/lib/types/art'
import { artMaterials, artSizesForMaterial, PRINT_MATERIALS } from '@/lib/types/art'
import { formatPrice } from '@/lib/types/product'
import { useCart } from '@/lib/store/cart'
import MaterialSelector from '@/components/art/MaterialSelector'

interface ArtConfiguratorProps {
  art: ArtProduct
}

export default function ArtConfigurator({ art }: ArtConfiguratorProps) {
  const { addArtItem } = useCart()

  const availableMaterials = artMaterials(art)
  const [selectedMaterial, setSelectedMaterial] = useState<PrintMaterial>(availableMaterials[0])
  const [selectedVariant,  setSelectedVariant]  = useState<ArtMaterialVariant | null>(
    artSizesForMaterial(art, availableMaterials[0])[0] ?? null
  )
  const [qty,   setQty]   = useState(1)
  const [added, setAdded] = useState(false)

  // Plain function: the React Compiler memoises this automatically, and the
  // hand-written useCallback was one it could not preserve.
  function handleMaterialChange(mat: PrintMaterial) {
    setSelectedMaterial(mat)
    const firstSize = artSizesForMaterial(art, mat)[0]
    setSelectedVariant(firstSize ?? null)
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addArtItem(art, selectedVariant, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const sizesForMaterial = artSizesForMaterial(art, selectedMaterial)
  const inStock = selectedVariant ? selectedVariant.stockQty > 0 : false
  const materialMeta = PRINT_MATERIALS.find((m) => m.id === selectedMaterial)

  return (
    <div className="flex flex-col gap-8">

      {/* ── Title block ── */}
      <div>
        <span className="font-body text-[10px] uppercase tracking-[0.28em] text-gold mb-3 block">
          {art.medium} · ODSArts Studio
        </span>
        <h1 className="font-display text-[clamp(28px,3vw,44px)] leading-[1.08] tracking-[-0.02em] text-obsidian mb-3">
          {art.name}
        </h1>
        <p className="font-body text-[14px] text-pewter italic leading-relaxed">
          {art.tagline}
        </p>
      </div>

      {/* ── Description ── */}
      <p className="font-body text-[14px] text-pewter leading-[1.85] border-l-2 border-gold/40 pl-4">
        {art.description}
      </p>

      {/* ── Print Material ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian">
            Print Material
          </span>
          {materialMeta && (
            <span className="font-body text-[11px] text-pewter">
              {materialMeta.label}
            </span>
          )}
        </div>
        <MaterialSelector
          available={availableMaterials}
          selected={selectedMaterial}
          onChange={handleMaterialChange}
        />
      </div>

      {/* ── Size ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian">
            Size
          </span>
          {selectedVariant && (
            <span className="font-body text-[11px] text-pewter">
              {selectedVariant.dimensionsCm}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sizesForMaterial.map((variant) => {
            const isSelected  = selectedVariant?.id === variant.id
            const isAvailable = variant.stockQty > 0
            return (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={!isAvailable}
                className="relative p-3 text-left focus:outline-none transition-all duration-200"
                style={{
                  border: `1px solid ${isSelected ? '#C9A96E' : 'rgba(14,13,11,0.12)'}`,
                  background: isSelected ? 'rgba(201,169,110,0.05)' : 'transparent',
                  opacity: isAvailable ? 1 : 0.4,
                }}
              >
                <span
                  className="block font-body text-[12px] font-medium"
                  style={{ color: isSelected ? '#C9A96E' : 'rgba(14,13,11,0.7)' }}
                >
                  {variant.sizeLabel}
                </span>
                <span className="block font-display text-[15px] text-obsidian mt-1">
                  {formatPrice(variant.pricePaise)}
                </span>
                {!isAvailable && (
                  <span className="block font-body text-[10px] text-pewter/50 mt-0.5">Sold out</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Qty ── */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian">Qty</span>
        <div className="flex items-center border border-obsidian/15">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-obsidian hover:bg-obsidian/5 focus:outline-none font-body"
          >
            −
          </button>
          <span className="w-9 text-center font-body text-sm text-obsidian tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-9 h-9 flex items-center justify-center text-obsidian hover:bg-obsidian/5 focus:outline-none font-body"
          >
            +
          </button>
        </div>
        {selectedVariant && (
          <span className="font-display text-[20px] text-obsidian ml-auto">
            {formatPrice(selectedVariant.pricePaise * qty)}
          </span>
        )}
      </div>

      {/* ── Add to Cart ── */}
      <motion.button
        onClick={handleAddToCart}
        disabled={!inStock || !selectedVariant}
        whileHover={{ scale: inStock ? 1.01 : 1 }}
        whileTap={{ scale: inStock ? 0.99 : 1 }}
        className="w-full py-5 font-body text-[11px] uppercase tracking-[0.25em] transition-all duration-500 focus:outline-none"
        style={{
          background: added ? '#4A6741' : inStock ? '#0E0D0B' : 'rgba(14,13,11,0.25)',
          color: '#F5F0E8',
          cursor: inStock ? 'pointer' : 'not-allowed',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={added ? 'added' : 'add'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {added ? '✓ Added to Cart' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* ── Trust strip ── */}
      <div className="flex flex-col gap-2 border-t border-obsidian/8 pt-6">
        {[
          { icon: '🎨', text: 'Printed to order — never mass produced' },
          { icon: '📦', text: `Dispatches in ${art.deliveryDays} working days` },
          { icon: '🛡️', text: 'Colour-accurate guarantee — or we reprint' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <span className="text-[14px]">{icon}</span>
            <span className="font-body text-[12px] text-pewter">{text}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
