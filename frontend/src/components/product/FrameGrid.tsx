'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/lib/types/product'
import type { ProductFilterParams } from '@/lib/types/filters'
import { deserializeFilters, serializeFilters } from '@/lib/types/filters'
import FilterPanel from '@/components/product/FilterPanel'
import FrameCard from '@/components/product/FrameCard'

interface FrameGridProps {
  products: Product[]
}

function lowestPrice(p: Product) {
  return Math.min(...p.variants.map((v) => v.basePricePaise))
}

function applyFilters(products: Product[], filters: ProductFilterParams): Product[] {
  let list = [...products]

  if (filters.collections?.length) {
    list = list.filter((p) => filters.collections!.includes(p.collectionSlug))
  }
  if (filters.sizes?.length) {
    list = list.filter((p) => p.variants.some((v) => filters.sizes!.includes(v.sizeLabel)))
  }
  if (filters.minPricePaise != null) {
    list = list.filter((p) => lowestPrice(p) >= filters.minPricePaise!)
  }
  if (filters.maxPricePaise != null) {
    list = list.filter((p) => lowestPrice(p) <= filters.maxPricePaise!)
  }
  if (filters.inStockOnly) {
    list = list.filter((p) => p.variants.some((v) => v.stockQty > 0))
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.materials.some((m) => m.toLowerCase().includes(q))
    )
  }
  switch (filters.sort) {
    case 'price_asc':    list.sort((a, b) => lowestPrice(a) - lowestPrice(b)); break
    case 'price_desc':   list.sort((a, b) => lowestPrice(b) - lowestPrice(a)); break
    case 'delivery_asc': list.sort((a, b) => a.deliveryDays - b.deliveryDays); break
  }
  return list
}

export default function FrameGrid({ products }: FrameGridProps) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [filterOpen, setFilterOpen] = useState(false)

  // Read filters from URL
  const filters = useMemo(
    () => deserializeFilters(searchParams),
    [searchParams]
  )

  // Apply filters client-side (SSR already did a first pass via page.tsx searchParams)
  const filtered = useMemo(() => applyFilters(products, filters), [products, filters])

  // Count active filters for the badge
  const allPrices  = products.map(lowestPrice)
  const globalMin  = Math.min(...allPrices)
  const globalMax  = Math.max(...allPrices)
  const priceActive =
    (filters.minPricePaise ?? globalMin) > globalMin ||
    (filters.maxPricePaise ?? globalMax) < globalMax

  const activeCount =
    (filters.collections?.length ?? 0) +
    (filters.sizes?.length ?? 0) +
    (filters.inStockOnly ? 1 : 0) +
    (priceActive ? 1 : 0)

  // Write filters back to URL
  const updateFilters = useCallback(
    (patch: Partial<ProductFilterParams>) => {
      const next = { ...filters, ...patch }
      const sp   = serializeFilters(next)
      startTransition(() => {
        router.push(`${pathname}${sp.toString() ? `?${sp}` : ''}`, { scroll: false })
      })
    },
    [filters, router, pathname]
  )

  const clearAll = useCallback(() => {
    startTransition(() => router.push(pathname, { scroll: false }))
  }, [router, pathname])

  // Active filter chips for the strip above the grid
  const activeChips: { label: string; clear: () => void }[] = [
    ...(filters.collections ?? []).map((c) => ({
      label: c.charAt(0).toUpperCase() + c.slice(1),
      clear: () => updateFilters({ collections: filters.collections!.filter((x) => x !== c) }),
    })),
    ...(filters.sizes ?? []).map((s) => ({
      label: s,
      clear: () => updateFilters({ sizes: filters.sizes!.filter((x) => x !== s) }),
    })),
    ...(filters.inStockOnly
      ? [{ label: 'In Stock', clear: () => updateFilters({ inStockOnly: false }) }]
      : []),
    ...(priceActive
      ? [{ label: 'Price range', clear: () => updateFilters({ minPricePaise: undefined, maxPricePaise: undefined }) }]
      : []),
  ]

  return (
    <div className="flex gap-10 xl:gap-14 items-start">

      {/* ── Filter Panel (desktop sidebar / mobile drawer) ── */}
      <FilterPanel
        products={products}
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearAll}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      {/* ── Right: toolbar + grid ── */}
      <div className="flex-1 min-w-0">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">

          {/* Mobile filter trigger */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-pewter-dark hover:text-obsidian transition-colors focus:outline-none border border-obsidian/20 px-4 py-2"
          >
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <line x1="0" y1="1" x2="14" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="2" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="4" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Filters
            {activeCount > 0 && (
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center font-body text-[9px] text-ivory"
                style={{ background: '#C9A96E' }}
              >
                {activeCount}
              </span>
            )}
          </button>

          {/* Result count */}
          <p className="font-body text-[12px] text-pewter">
            <motion.span
              key={filtered.length}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-obsidian"
            >
              {filtered.length}
            </motion.span>{' '}
            {filtered.length === 1 ? 'frame' : 'frames'}
          </p>
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {activeChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-8 overflow-hidden"
            >
              {activeChips.map((chip) => (
                <motion.button
                  key={chip.label}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={chip.clear}
                  className="flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border border-gold/40 text-walnut hover:bg-gold/5 transition-colors focus:outline-none"
                >
                  {chip.label}
                  <span className="text-gold text-[12px] leading-none">×</span>
                </motion.button>
              ))}
              <motion.button
                layout
                onClick={clearAll}
                className="font-body text-[10px] uppercase tracking-[0.15em] text-pewter underline underline-offset-2 hover:text-obsidian transition-colors focus:outline-none px-1"
              >
                Clear all
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-14"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <FrameCard product={product} priority={i < 3} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-display text-[clamp(22px,2vw,32px)] text-obsidian mb-3">
              No frames match
            </p>
            <p className="font-body text-sm text-pewter mb-8">
              Try adjusting or clearing your filters.
            </p>
            <button
              onClick={clearAll}
              className="font-body text-[11px] uppercase tracking-[0.22em] text-ivory bg-obsidian px-8 py-4 hover:bg-walnut transition-colors duration-400 focus:outline-none"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
