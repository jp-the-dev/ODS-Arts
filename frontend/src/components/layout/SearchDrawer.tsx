'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { searchGlobal } from '@/lib/services/search'
import { formatPrice } from '@/lib/types/product'
import { artLowestPrice } from '@/lib/types/art'
import type { Product } from '@/lib/types/product'
import type { ArtProduct } from '@/lib/types/art'

type UnifiedResult = { type: 'frame'; item: Product } | { type: 'art'; item: ArtProduct }

interface SearchDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const COLLECTION_LABEL: Record<string, string> = {
  walnut:   'Walnut Series',
  gallery:  'Gallery Series',
  heritage: 'Heritage Collection',
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const router     = useRouter()
  const inputRef   = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<UnifiedResult[]>([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [focused,  setFocused]  = useState(0) // keyboard nav index

  // Auto-focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Debounced search
  const runSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); setTotal(0); setLoading(false); return }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchGlobal(q, 6)
        const combined: UnifiedResult[] = [
          ...res.products.map((p) => ({ type: 'frame' as const, item: p })),
          ...res.art.map((a) => ({ type: 'art' as const, item: a })),
        ]
        setResults(combined)
        setTotal(res.total)
        setFocused(0)
      } finally {
        setLoading(false)
      }
    }, 200)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    runSearch(v)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape')     { onClose(); return }
    if (e.key === 'ArrowDown')  { setFocused((f) => Math.min(f + 1, results.length - 1)); return }
    if (e.key === 'ArrowUp')    { setFocused((f) => Math.max(f - 1, 0)); return }
    if (e.key === 'Enter' && results[focused]) {
      navigateTo(results[focused])
    }
  }

  const navigateTo = (result: UnifiedResult) => {
    onClose()
    if (result.type === 'frame') {
      router.push(`/collections/${result.item.collectionSlug}?frame=${result.item.slug}`)
    } else {
      router.push(`/art/${result.item.categorySlug}/${result.item.slug}`)
    }
  }

  const showViewAll = total > 6 && query.trim()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(14,13,11,0.75)', backdropFilter: 'blur(6px)' }}
          />

          {/* Search panel */}
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-[201] mx-auto"
            style={{ maxWidth: '680px', marginTop: '72px', padding: '0 16px' }}
            onKeyDown={handleKeyDown}
          >
            {/* Input */}
            <div
              className="flex items-center gap-4 px-6 py-4 bg-ivory"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}
            >
              {/* Search icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 text-pewter">
                <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M11.5 11.5L16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>

              <input
                ref={inputRef}
                value={query}
                onChange={handleChange}
                placeholder="Search frames, materials, collections…"
                className="flex-1 bg-transparent font-body text-[15px] text-obsidian placeholder:text-pewter/60 focus:outline-none"
              />

              {/* Loading spinner */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-4 h-4 rounded-full border border-t-gold animate-spin flex-shrink-0"
                    style={{ borderColor: 'rgba(14,13,11,0.15)', borderTopColor: '#C9A96E' }}
                  />
                )}
              </AnimatePresence>

              {/* Clear */}
              {query && !loading && (
                <button
                  onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
                  className="text-pewter hover:text-obsidian transition-colors focus:outline-none text-lg leading-none"
                >
                  ×
                </button>
              )}

              {/* Escape hint */}
              <span className="hidden md:block font-body text-[10px] uppercase tracking-[0.15em] text-pewter/50 flex-shrink-0 border border-obsidian/10 px-1.5 py-0.5">
                Esc
              </span>
            </div>

            {/* Results dropdown */}
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-ivory mt-[1px] overflow-hidden"
                  style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}
                >
                  {/* Label */}
                  <div className="px-6 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(14,13,11,0.06)' }}>
                    <span className="font-body text-[10px] uppercase tracking-[0.25em] text-pewter">
                      Results
                    </span>
                    <div className="flex-1 h-[1px] bg-obsidian/5" />
                  </div>

                  {results.map((result, i) => {
                    const isArt = result.type === 'art'
                    const item = result.item as any
                    const heroImg = item.images.find((img: any) => img.role === 'hero') ?? item.images[0]
                    const lp = isArt ? artLowestPrice(item) : Math.min(...item.variants.map((v: any) => v.basePricePaise))
                    const eyebrow = isArt 
                      ? `${item.categorySlug.charAt(0).toUpperCase() + item.categorySlug.slice(1)} Art`
                      : (COLLECTION_LABEL[item.collectionSlug] ?? item.collectionSlug)
                    const isFocused = i === focused

                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(result)}
                        onMouseEnter={() => setFocused(i)}
                        className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors focus:outline-none"
                        style={{
                          background: isFocused ? 'rgba(201,169,110,0.06)' : 'transparent',
                          borderBottom: '1px solid rgba(14,13,11,0.05)',
                        }}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-12 h-14 flex-shrink-0 bg-ivory-200 overflow-hidden">
                          {heroImg && (
                            <Image src={heroImg.url} alt={heroImg.alt} fill sizes="48px" className="object-cover" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <span className="block font-body text-[9px] uppercase tracking-[0.25em] text-gold mb-0.5">
                            {eyebrow}
                          </span>
                          <span className="block font-display text-[15px] text-obsidian leading-tight">
                            {item.name}
                          </span>
                          <span className="block font-body text-[12px] text-pewter mt-0.5 italic truncate">
                            {item.tagline}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <span className="font-body text-[9px] uppercase tracking-[0.1em] text-pewter block">from</span>
                          <span className="font-display text-[15px] text-obsidian">{formatPrice(lp)}</span>
                        </div>

                        {/* Arrow */}
                        <span className="text-pewter text-sm ml-1 flex-shrink-0">→</span>
                      </button>
                    )
                  })}

                  {/* View all */}
                  {showViewAll && (
                    <button
                      onClick={() => {
                        onClose()
                        router.push(`/collections?q=${encodeURIComponent(query)}`)
                      }}
                      className="w-full px-6 py-4 flex items-center justify-between font-body text-[11px] uppercase tracking-[0.2em] text-gold hover:bg-gold/5 transition-colors focus:outline-none"
                    >
                      <span>View all {total} results for &ldquo;{query}&rdquo;</span>
                      <span>→</span>
                    </button>
                  )}
                </motion.div>
              )}

              {/* No results */}
              {!loading && query.trim() && results.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-ivory mt-[1px] px-6 py-10 text-center"
                  style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}
                >
                  <p className="font-display text-xl text-obsidian mb-2">Nothing found</p>
                  <p className="font-body text-[13px] text-pewter mb-6">
                    Try searching for walnut, heritage, canvas, or nature.
                  </p>
                  <button
                    onClick={() => { onClose(); router.push('/collections') }}
                    className="font-body text-[11px] uppercase tracking-[0.2em] text-gold border-b border-gold hover:text-walnut transition-colors"
                  >
                    Explore all frames →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
