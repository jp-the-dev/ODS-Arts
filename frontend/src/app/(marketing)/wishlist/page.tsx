'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '@/lib/store/wishlist'
import { MOCK_PRODUCTS } from '@/lib/mock/products'
import { formatPrice } from '@/lib/types/product'
import WishlistButton from '@/components/product/WishlistButton'

export default function WishlistPage() {
  const { slugs } = useWishlist()

  // Resolve slugs → full product objects (from mock; will use API when live)
  const products = useMemo(
    () => MOCK_PRODUCTS.filter((p) => slugs.includes(p.slug)),
    [slugs]
  )

  const COLLECTION_LABEL: Record<string, string> = {
    'box-frame':     'Box Frame',
    'gallery-frame': 'Gallery Frame',
    'glass-frame':   'Glass Frame',
  }

  return (
    <main className="bg-ivory min-h-screen">

      {/* ── Header ── */}
      <section className="relative pt-40 pb-16 md:pt-52 md:pb-20 px-6 text-center overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,169,110,0.08) 0%, transparent 65%)' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-gold/50" />
            <span className="font-body text-[10px] uppercase tracking-[0.35em] text-gold">Your Edit</span>
            <div className="h-[1px] w-12 bg-gold/50" />
          </div>
          <h1 className="font-display text-[clamp(36px,4.5vw,68px)] leading-[1.05] tracking-[-0.02em] text-obsidian mb-6">
            Saved <em className="italic text-walnut not-italic">Frames</em>
          </h1>
          <p className="font-body text-[15px] text-pewter">
            {products.length > 0
              ? `${products.length} frame${products.length > 1 ? 's' : ''} saved to your edit`
              : 'Your edit is empty'}
          </p>
        </div>
      </section>

      {/* ── Grid or empty state ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-32">
        <AnimatePresence mode="popLayout">
          {products.length > 0 ? (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14"
            >
              {products.map((product, i) => {
                const heroImg     = product.images.find((img) => img.role === 'hero') ?? product.images[0]
                const lowestPrice = Math.min(...product.variants.map((v) => v.basePricePaise))
                const href        = `/collections/${product.collectionSlug}?frame=${product.slug}`

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="group"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-ivory-200 mb-4">
                      {heroImg && (
                        <Link href={href}>
                          <Image
                            src={heroImg.url}
                            alt={heroImg.alt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                          />
                        </Link>
                      )}
                      {/* Wishlist remove */}
                      <div className="absolute top-3 right-3">
                        <WishlistButton product={product} />
                      </div>
                    </div>

                    {/* Info */}
                    <Link href={href} className="block focus:outline-none">
                      <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold">
                        {COLLECTION_LABEL[product.collectionSlug] ?? product.collectionSlug}
                      </span>
                      <h3 className="font-display text-[18px] text-obsidian mt-1 mb-1">{product.name}</h3>
                      <p className="font-body text-[12px] text-pewter italic mb-3 line-clamp-1">{product.tagline}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-obsidian/8">
                        <div>
                          <span className="font-body text-[9px] uppercase tracking-[0.15em] text-pewter block">from</span>
                          <span className="font-display text-[17px] text-obsidian">{formatPrice(lowestPrice)}</span>
                        </div>
                        <span className="font-body text-[10px] uppercase tracking-[0.18em] text-gold group-hover:tracking-[0.25em] transition-all duration-500">
                          Explore →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-24 text-center"
            >
              {/* Empty heart */}
              <div className="mb-8 w-20 h-20 rounded-full bg-ivory-200 flex items-center justify-center">
                <svg width="32" height="30" viewBox="0 0 32 30" fill="none">
                  <path
                    d="M16 27C16 27 2 18 2 9C2 5.134 5.134 2 9 2C11.827 2 14.268 3.528 15.5 5.844C16.732 3.528 19.173 2 22 2C25.866 2 29 5.134 29 9C29 18 16 27 16 27Z"
                    stroke="#C9A96E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="font-display text-[clamp(22px,2.5vw,36px)] text-obsidian mb-4">
                Your edit is empty
              </p>
              <p className="font-body text-[14px] text-pewter max-w-sm mb-10 leading-relaxed">
                Save frames you love while browsing — they&apos;ll appear here for easy return.
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center gap-3 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:bg-walnut transition-colors duration-500"
              >
                Start Exploring
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </main>
  )
}
