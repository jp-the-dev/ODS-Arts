'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product } from '@/lib/types/product'
import { formatPrice } from '@/lib/types/product'

interface ProductSelectorProps {
  products: Product[]
  selectedId: string
  onSelect: (product: Product) => void
}

export default function ProductSelector({ products, selectedId, onSelect }: ProductSelectorProps) {
  return (
    <div className="w-full border-b border-obsidian/8 pb-10 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian">
          {products.length} Frames in this Series
        </p>
        <p className="font-body text-[11px] text-pewter">Select a profile to configure</p>
      </div>

      {/* Horizontal scrollable product rail */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {products.map((product, i) => {
          const heroImg = product.images.find(img => img.role === 'hero') ?? product.images[0]
          const isSelected = product.id === selectedId
          const lowestPrice = Math.min(...product.variants.map(v => v.basePricePaise))

          return (
            <motion.button
              key={product.id}
              onClick={() => onSelect(product)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`flex-shrink-0 w-[160px] md:w-[180px] text-left group focus:outline-none transition-all duration-300 ${
                isSelected ? 'ring-2 ring-obsidian ring-offset-2' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className={`relative w-full aspect-[4/5] overflow-hidden mb-3 transition-all duration-500 ${
                isSelected ? 'bg-obsidian/5' : 'bg-ivory-200 group-hover:bg-obsidian/5'
              }`}>
                {heroImg && (
                  <Image
                    src={heroImg.url}
                    alt={heroImg.alt}
                    fill
                    sizes="180px"
                    className={`object-cover transition-all duration-700 ${
                      isSelected ? 'opacity-100 scale-105' : 'opacity-70 group-hover:opacity-90 group-hover:scale-102'
                    }`}
                  />
                )}
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-obsidian rounded-full flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-0.5">
                <h3 className={`font-display text-[15px] leading-snug mb-0.5 transition-colors duration-200 ${
                  isSelected ? 'text-obsidian' : 'text-pewter-dark group-hover:text-obsidian'
                }`}>
                  {product.name}
                </h3>
                <p className="font-body text-[11px] text-pewter leading-tight mb-1.5">
                  {product.tagline}
                </p>
                <p className="font-body text-[12px] text-obsidian font-medium">
                  from {formatPrice(lowestPrice)}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
