'use client'

import { useQuickView } from '@/providers/QuickViewProvider'
import type { Product } from '@/lib/types/product'

export default function QuickViewTrigger({ product }: { product: Product }) {
  const { openQuickView } = useQuickView()
  return (
    <button
      onClick={(e) => { e.preventDefault(); openQuickView(product) }}
      className="w-full py-3 bg-obsidian/90 backdrop-blur-sm font-body text-[10px] uppercase tracking-[0.25em] text-ivory hover:bg-walnut transition-colors duration-300 focus:outline-none"
    >
      Quick View
    </button>
  )
}
