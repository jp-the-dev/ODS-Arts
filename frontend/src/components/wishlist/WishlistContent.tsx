'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '@/lib/store/wishlist'
import { formatPrice } from '@/lib/types/product'
import type { Product } from '@/lib/types/product'
import type { ArtProduct } from '@/lib/types/art'
import WishlistButton from '@/components/product/WishlistButton'

const COLLECTION_LABEL: Record<string, string> = {
  walnut: 'Walnut Series',
  gallery: 'Gallery Series',
  heritage: 'Heritage Collection',
}

/** One saved item, flattened so frames and art render through the same card. */
interface SavedEntry {
  key: string
  kind: 'frame' | 'art'
  slug: string
  name: string
  tagline: string
  eyebrow: string
  href: string
  image?: { url: string; alt: string }
  lowestPricePaise: number
  product?: Product
}

interface Props {
  /** Full catalogues, resolved server-side; this filters them by what's saved. */
  products: Product[]
  art: ArtProduct[]
}

export default function WishlistContent({ products, art }: Props) {
  const { slugs, types } = useWishlist()

  const entries = useMemo<SavedEntry[]>(() => {
    // A slug can exist in both catalogues, so the saved type decides which
    // list to resolve against; anything unknown falls back to frames.
    return slugs.flatMap((slug): SavedEntry[] => {
      if (types[slug] === 'art') {
        const piece = art.find((a) => a.slug === slug)
        if (!piece) return []

        const image = piece.images.find((i) => i.role === 'hero') ?? piece.images[0]

        return [{
          key: `art-${piece.id}`,
          kind: 'art',
          slug: piece.slug,
          name: piece.name,
          tagline: piece.tagline,
          eyebrow: piece.medium,
          href: `/art/${piece.categorySlug}/${piece.slug}`,
          image: image ? { url: image.url, alt: image.alt } : undefined,
          lowestPricePaise: piece.materialVariants.length
            ? Math.min(...piece.materialVariants.map((v) => v.pricePaise))
            : 0,
        }]
      }

      const product = products.find((p) => p.slug === slug)
      if (!product) return []

      const image = product.images.find((i) => i.role === 'hero') ?? product.images[0]

      return [{
        key: `frame-${product.id}`,
        kind: 'frame',
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        eyebrow: COLLECTION_LABEL[product.collectionSlug] ?? product.collectionSlug,
        href: `/products/${product.slug}`,
        image: image ? { url: image.url, alt: image.alt } : undefined,
        lowestPricePaise: product.variants.length
          ? Math.min(...product.variants.map((v) => v.basePricePaise))
          : 0,
        product,
      }]
    })
  }, [slugs, types, products, art])

  const frameCount = entries.filter((e) => e.kind === 'frame').length
  const artCount = entries.length - frameCount

  const summary = entries.length === 0
    ? 'Your edit is empty'
    : [
        frameCount > 0 ? `${frameCount} frame${frameCount > 1 ? 's' : ''}` : null,
        artCount > 0 ? `${artCount} art print${artCount > 1 ? 's' : ''}` : null,
      ].filter(Boolean).join(' · ') + ' saved to your edit'

  return (
    <>
      <p className="font-body text-[15px] text-pewter text-center px-6 -mt-10">{summary}</p>

      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-32 pt-16">
        <AnimatePresence mode="popLayout">
          {entries.length > 0 ? (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14"
            >
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.key}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-ivory-200 mb-4">
                    {entry.image && (
                      <Link href={entry.href}>
                        <Image
                          src={entry.image.url}
                          alt={entry.image.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        />
                      </Link>
                    )}

                    <div className="absolute top-3 right-3">
                      {/* Art has no Product to hand the button, so it takes the
                          art slug instead — which is also how it tags the type. */}
                      {entry.kind === 'art'
                        ? <WishlistButton artSlug={entry.slug} />
                        : entry.product && <WishlistButton product={entry.product} />}
                    </div>

                    {entry.kind === 'art' && (
                      <span className="absolute top-3 left-3 font-body text-[9px] uppercase tracking-[0.18em] text-obsidian bg-ivory/90 px-2 py-1">
                        Art
                      </span>
                    )}
                  </div>

                  <Link href={entry.href} className="block focus:outline-none">
                    <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold">
                      {entry.eyebrow}
                    </span>
                    <h3 className="font-display text-[18px] text-obsidian mt-1 mb-1">{entry.name}</h3>
                    <p className="font-body text-[12px] text-pewter italic mb-3 line-clamp-1">
                      {entry.tagline}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-obsidian/8">
                      <div>
                        <span className="font-body text-[9px] uppercase tracking-[0.15em] text-pewter block">
                          from
                        </span>
                        <span className="font-display text-[17px] text-obsidian">
                          {formatPrice(entry.lowestPricePaise)}
                        </span>
                      </div>
                      <span className="font-body text-[10px] uppercase tracking-[0.18em] text-gold group-hover:tracking-[0.25em] transition-all duration-500">
                        Explore →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-24 text-center"
            >
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
                Save frames and art you love while browsing — they&apos;ll appear here for
                easy return.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-3 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:bg-walnut transition-colors duration-500"
                >
                  Browse Frames
                </Link>
                <Link
                  href="/art"
                  className="inline-flex items-center gap-3 border border-obsidian/25 text-obsidian font-body text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:border-obsidian transition-colors duration-500"
                >
                  Browse Art
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}
