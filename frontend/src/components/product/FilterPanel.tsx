'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/lib/types/product'
import type { ProductFilterParams, SortKey } from '@/lib/types/filters'
import PriceRangeSlider from '@/components/product/PriceRangeSlider'

interface FilterPanelProps {
  products: Product[]           // full (unfiltered) list to derive ranges/options
  filters: ProductFilterParams
  onChange: (patch: Partial<ProductFilterParams>) => void
  onClearAll: () => void
  isOpen: boolean               // controls mobile drawer
  onClose: () => void
}

const COLLECTIONS = [
  { slug: 'box-frame',     label: 'Box Frame'         },
  { slug: 'gallery-frame', label: 'Gallery Frame'      },
  { slug: 'glass-frame',   label: 'Glass Frame'        },
]

const SIZES = ['8" × 10"', '11" × 14"', '16" × 20"', '20" × 24"']

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recommended',  label: 'Recommended'        },
  { key: 'price_asc',    label: 'Price: Low → High'  },
  { key: 'price_desc',   label: 'Price: High → Low'  },
  { key: 'newest',       label: 'Newest First'        },
  { key: 'delivery_asc', label: 'Fastest Delivery'    },
]

function toggleInArray<T>(arr: T[] | undefined, val: T): T[] {
  const list = arr ?? []
  return list.includes(val) ? list.filter((x) => x !== val) : [...list, val]
}

const SECTION_LABEL = 'font-body text-[10px] uppercase tracking-[0.28em] mb-3 block'

export default function FilterPanel({
  products,
  filters,
  onChange,
  onClearAll,
  isOpen,
  onClose,
}: FilterPanelProps) {
  // Derive price bounds from full product list
  const allPrices = products.map((p) =>
    Math.min(...p.variants.map((v) => v.basePricePaise))
  )
  const globalMin = Math.min(...allPrices)
  const globalMax = Math.max(...allPrices)

  const currentMin = filters.minPricePaise ?? globalMin
  const currentMax = filters.maxPricePaise ?? globalMax

  const activeCount =
    (filters.collections?.length ?? 0) +
    (filters.sizes?.length ?? 0) +
    (filters.inStockOnly ? 1 : 0) +
    (currentMin > globalMin || currentMax < globalMax ? 1 : 0)

  const content = (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(14,13,11,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-body text-[11px] uppercase tracking-[0.25em] text-obsidian">
            Filters
          </span>
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="w-5 h-5 rounded-full flex items-center justify-center font-body text-[10px] text-ivory"
                style={{ background: '#C9A96E' }}
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-4">
          {activeCount > 0 && (
            <button
              onClick={onClearAll}
              className="font-body text-[10px] uppercase tracking-[0.2em] text-gold underline underline-offset-2 focus:outline-none hover:text-walnut transition-colors"
            >
              Clear all
            </button>
          )}
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-pewter hover:text-obsidian transition-colors focus:outline-none"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Scrollable filter body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">

        {/* ── Sort ─────────────────────────────────────── */}
        <div>
          <span className={`${SECTION_LABEL} text-pewter`}>Sort by</span>
          <div className="flex flex-col gap-0" style={{ borderTop: '1px solid rgba(14,13,11,0.06)' }}>
            {SORT_OPTIONS.map((opt) => {
              const active = (filters.sort ?? 'recommended') === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => onChange({ sort: opt.key })}
                  className="flex items-center justify-between py-2.5 text-left transition-colors focus:outline-none group"
                  style={{ borderBottom: '1px solid rgba(14,13,11,0.06)' }}
                >
                  <span
                    className="font-body text-[12px] transition-colors"
                    style={{ color: active ? '#0E0D0B' : 'rgba(14,13,11,0.45)' }}
                  >
                    {opt.label}
                  </span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C9A96E' }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Collection ───────────────────────────────── */}
        <div>
          <span className={`${SECTION_LABEL} text-pewter`}>Collection</span>
          <div className="flex flex-col gap-2">
            {COLLECTIONS.map(({ slug, label }) => {
              const active = filters.collections?.includes(slug)
              return (
                <button
                  key={slug}
                  onClick={() =>
                    onChange({ collections: toggleInArray(filters.collections, slug) })
                  }
                  className={`flex items-center gap-3 py-2 px-3 text-left border transition-all duration-200 focus:outline-none ${
                    active
                      ? 'border-obsidian bg-obsidian text-ivory'
                      : 'border-obsidian/15 text-pewter-dark hover:border-obsidian/40 hover:text-obsidian'
                  }`}
                >
                  <span className="font-body text-[11px] uppercase tracking-[0.12em]">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Size ─────────────────────────────────────── */}
        <div>
          <span className={`${SECTION_LABEL} text-pewter`}>Size</span>
          <div className="grid grid-cols-2 gap-2">
            {SIZES.map((size) => {
              const active = filters.sizes?.includes(size)
              return (
                <button
                  key={size}
                  onClick={() =>
                    onChange({ sizes: toggleInArray(filters.sizes, size) })
                  }
                  className={`py-2 px-3 font-body text-[11px] border text-center transition-all duration-200 focus:outline-none ${
                    active
                      ? 'border-obsidian bg-obsidian text-ivory'
                      : 'border-obsidian/15 text-pewter-dark hover:border-obsidian/40 hover:text-obsidian'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Price Range ───────────────────────────────── */}
        <div>
          <span className={`${SECTION_LABEL} text-pewter`}>Price Range</span>
          <PriceRangeSlider
            minPaise={globalMin}
            maxPaise={globalMax}
            currentMin={currentMin}
            currentMax={currentMax}
            onChange={(min, max) =>
              onChange({
                minPricePaise: min <= globalMin ? undefined : min,
                maxPricePaise: max >= globalMax ? undefined : max,
              })
            }
          />
        </div>

        {/* ── In-Stock Only ─────────────────────────────── */}
        <div>
          <button
            onClick={() => onChange({ inStockOnly: !filters.inStockOnly })}
            className="flex items-center gap-3 group focus:outline-none"
          >
            {/* Custom toggle */}
            <div
              className="relative w-9 h-5 rounded-full transition-colors duration-300 flex-shrink-0"
              style={{ background: filters.inStockOnly ? '#C9A96E' : 'rgba(14,13,11,0.12)' }}
            >
              <motion.div
                layout
                className="absolute top-0.5 w-4 h-4 rounded-full bg-ivory shadow-sm"
                style={{ left: filters.inStockOnly ? '18px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            </div>
            <span className="font-body text-[11px] uppercase tracking-[0.15em] text-pewter-dark group-hover:text-obsidian transition-colors">
              In-stock only
            </span>
          </button>
        </div>

      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop: static sidebar column ──────────────── */}
      <aside
        className="hidden lg:flex flex-col w-[220px] xl:w-[240px] flex-shrink-0 self-start sticky top-[88px] bg-ivory border border-obsidian/8 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 100px)' }}
      >
        {content}
      </aside>

      {/* ── Mobile: AnimatePresence slide-in drawer ─────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 z-[150] lg:hidden"
              style={{ background: 'rgba(14,13,11,0.5)', backdropFilter: 'blur(4px)' }}
            />
            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-[151] lg:hidden w-[300px] bg-ivory overflow-hidden flex flex-col"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
