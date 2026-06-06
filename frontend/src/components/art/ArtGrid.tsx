'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import type { ArtProduct, ArtStyle, PrintMaterial } from '@/lib/types/art'
import { artLowestPrice } from '@/lib/types/art'
import { PRINT_MATERIALS } from '@/lib/types/art'
import { ART_CATEGORIES } from '@/lib/data/artCategories'
import ArtCard from '@/components/art/ArtCard'

interface ArtGridProps {
  initialArt: ArtProduct[]
}

type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'newest'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc',   label: 'Price: Low → High' },
  { value: 'price_desc',  label: 'Price: High → Low' },
  { value: 'newest',      label: 'Newest' },
]

export default function ArtGrid({ initialArt }: ArtGridProps) {
  const router        = useRouter()
  const searchParams  = useSearchParams()

  // ── Read URL state ─────────────────────────────────────────────────────────
  const activeCategories = (searchParams.get('cat')?.split(',').filter(Boolean) ?? []) as ArtStyle[]
  const activeMaterials  = (searchParams.get('mat')?.split(',').filter(Boolean) ?? []) as PrintMaterial[]
  const activeSort       = (searchParams.get('sort') ?? 'recommended') as SortKey
  const [showFilters, setShowFilters] = useState(false)

  // ── URL updater ────────────────────────────────────────────────────────────
  const pushParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const toggleCategory = (slug: ArtStyle) => {
    const next = activeCategories.includes(slug)
      ? activeCategories.filter((c) => c !== slug)
      : [...activeCategories, slug]
    pushParams({ cat: next.join(',') || null })
  }

  const toggleMaterial = (mat: PrintMaterial) => {
    const next = activeMaterials.includes(mat)
      ? activeMaterials.filter((m) => m !== mat)
      : [...activeMaterials, mat]
    pushParams({ mat: next.join(',') || null })
  }

  const clearFilters = () => pushParams({ cat: null, mat: null, sort: null })

  // ── Client-side filtering & sorting ───────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...initialArt]

    if (activeCategories.length > 0) {
      result = result.filter((a) => activeCategories.includes(a.categorySlug))
    }
    if (activeMaterials.length > 0) {
      result = result.filter((a) =>
        a.materialVariants.some((v) => activeMaterials.includes(v.material))
      )
    }

    switch (activeSort) {
      case 'price_asc':  result.sort((a, b) => artLowestPrice(a) - artLowestPrice(b)); break
      case 'price_desc': result.sort((a, b) => artLowestPrice(b) - artLowestPrice(a)); break
      case 'newest':     result.reverse(); break
    }

    return result
  }, [initialArt, activeCategories, activeMaterials, activeSort])

  const activeFilterCount = activeCategories.length + activeMaterials.length

  return (
    <div>
      {/* ── Controls bar ── */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-obsidian border border-obsidian/20 px-4 py-2.5 hover:border-obsidian transition-colors"
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M0 1h14M3 5h8M6 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full text-[10px] text-ivory flex items-center justify-center" style={{ background: '#C9A96E' }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort — full width on mobile */}
        <select
          value={activeSort}
          onChange={(e) => pushParams({ sort: e.target.value === 'recommended' ? null : e.target.value })}
          className="flex-1 sm:flex-none font-body text-[11px] uppercase tracking-[0.15em] text-obsidian bg-transparent border border-obsidian/20 px-4 py-2.5 focus:outline-none focus:border-obsidian"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Result count */}
        <span className="font-body text-[12px] text-pewter ml-auto">
          {filtered.length} {filtered.length === 1 ? 'print' : 'prints'}
        </span>
      </div>

      {/* ── Filter panel (collapsible) ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-obsidian/8 bg-ivory">

              {/* Categories */}
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-3 block">Category</span>
                <div className="flex flex-wrap gap-2">
                  {ART_CATEGORIES.map((cat) => {
                    const active = activeCategories.includes(cat.slug)
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => toggleCategory(cat.slug)}
                        className="px-3 py-1.5 font-body text-[11px] uppercase tracking-[0.15em] transition-all duration-200"
                        style={{
                          border: `1px solid ${active ? '#C9A96E' : 'rgba(14,13,11,0.12)'}`,
                          background: active ? 'rgba(201,169,110,0.08)' : 'transparent',
                          color: active ? '#C9A96E' : 'rgba(14,13,11,0.55)',
                        }}
                      >
                        {cat.title}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Materials */}
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-3 block">Print Material</span>
                <div className="flex flex-wrap gap-2">
                  {PRINT_MATERIALS.map((mat) => {
                    const active = activeMaterials.includes(mat.id)
                    return (
                      <button
                        key={mat.id}
                        onClick={() => toggleMaterial(mat.id)}
                        className="flex items-center gap-2 px-3 py-1.5 font-body text-[11px] uppercase tracking-[0.15em] transition-all duration-200"
                        style={{
                          border: `1px solid ${active ? '#C9A96E' : 'rgba(14,13,11,0.12)'}`,
                          background: active ? 'rgba(201,169,110,0.08)' : 'transparent',
                          color: active ? '#C9A96E' : 'rgba(14,13,11,0.55)',
                        }}
                      >
                        <span className="w-3 h-3 flex-shrink-0 border border-obsidian/15" style={{ background: mat.swatchHex }} />
                        {mat.shortLabel}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Clear */}
            {activeFilterCount > 0 && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={clearFilters}
                  className="font-body text-[11px] uppercase tracking-[0.18em] text-pewter hover:text-obsidian transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Art grid ── */}
      <LayoutGroup>
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {filtered.map((art, i) => (
              <motion.div key={art.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ArtCard art={art} priority={i < 3} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-2xl text-obsidian mb-3">No prints match your filters</p>
            <p className="font-body text-[14px] text-pewter mb-8">Try removing a filter or browsing all categories.</p>
            <button onClick={clearFilters} className="font-body text-[11px] uppercase tracking-[0.2em] text-gold border-b border-gold">
              Clear all filters →
            </button>
          </div>
        )}
      </LayoutGroup>
    </div>
  )
}
