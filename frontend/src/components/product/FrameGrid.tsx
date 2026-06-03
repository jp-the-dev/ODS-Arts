'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/lib/types/product'
import FrameCard from '@/components/product/FrameCard'

interface FrameGridProps {
  products: Product[]
}

type FilterKey = 'all' | 'walnut' | 'gallery' | 'heritage'
type SortKey   = 'recommended' | 'price-asc' | 'price-desc'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All Frames'         },
  { key: 'walnut',   label: 'Walnut Series'       },
  { key: 'gallery',  label: 'Gallery Series'      },
  { key: 'heritage', label: 'Heritage Collection' },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended'          },
  { key: 'price-asc',   label: 'Price: Low to High'   },
  { key: 'price-desc',  label: 'Price: High to Low'   },
]

function lowestPrice(p: Product) {
  return Math.min(...p.variants.map(v => v.basePricePaise))
}

export default function FrameGrid({ products }: FrameGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [activeSort, setActiveSort]     = useState<SortKey>('recommended')
  const [sortOpen, setSortOpen]         = useState(false)

  const filtered = useMemo(() => {
    let list = activeFilter === 'all'
      ? products
      : products.filter(p => p.collectionSlug === activeFilter)

    if (activeSort === 'price-asc')  list = [...list].sort((a, b) => lowestPrice(a) - lowestPrice(b))
    if (activeSort === 'price-desc') list = [...list].sort((a, b) => lowestPrice(b) - lowestPrice(a))
    return list
  }, [products, activeFilter, activeSort])

  const currentSortLabel = SORTS.find(s => s.key === activeSort)?.label ?? 'Recommended'

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`font-body text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 border transition-all duration-300 focus:outline-none ${
                activeFilter === filter.key
                  ? 'border-obsidian bg-obsidian text-ivory'
                  : 'border-obsidian/20 text-pewter-dark hover:border-obsidian/50 hover:text-obsidian'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center gap-3 font-body text-[11px] uppercase tracking-[0.2em] text-pewter-dark hover:text-obsidian transition-colors duration-200 focus:outline-none"
          >
            <span>{currentSortLabel}</span>
            <svg
              width="10" height="6" viewBox="0 0 10 6" fill="none"
              className={`transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`}
            >
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 z-20 w-52 bg-ivory border border-obsidian/10 shadow-xl"
              >
                {SORTS.map(sort => (
                  <button
                    key={sort.key}
                    onClick={() => { setActiveSort(sort.key); setSortOpen(false) }}
                    className={`w-full text-left px-5 py-3.5 font-body text-[11px] uppercase tracking-[0.15em] transition-colors duration-150 focus:outline-none ${
                      activeSort === sort.key
                        ? 'text-obsidian bg-ivory-200'
                        : 'text-pewter hover:text-obsidian hover:bg-ivory-200'
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Result count ── */}
      <p className="font-body text-[12px] text-pewter mb-8">
        Showing <span className="text-obsidian">{filtered.length}</span> {filtered.length === 1 ? 'frame' : 'frames'}
        {activeFilter !== 'all' && (
          <> · <button
            onClick={() => setActiveFilter('all')}
            className="text-gold underline underline-offset-2 hover:text-gold-dark transition-colors focus:outline-none"
          >
            Clear filter
          </button></>
        )}
      </p>

      {/* ── Grid ── */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                duration: 0.4,
                delay: i * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <FrameCard product={product} priority={i < 3} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <p className="font-display text-2xl text-obsidian mb-3">No frames found</p>
          <p className="font-body text-sm text-pewter mb-6">Try clearing your filter to see all frames.</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="font-body text-[11px] uppercase tracking-[0.2em] text-gold border-b border-gold hover:text-gold-dark transition-colors"
          >
            View All Frames
          </button>
        </div>
      )}
    </div>
  )
}
