import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types/product'
import { formatPrice } from '@/lib/types/product'
import QuickViewTrigger from '@/components/product/QuickViewTrigger'
import WishlistButton from '@/components/product/WishlistButton'

interface FrameCardProps {
  product: Product
  priority?: boolean
}

const COLLECTION_LABEL: Record<string, string> = {
  'box-frame':     'Box Frame',
  'gallery-frame': 'Gallery Frame',
  'glass-frame':   'Glass Frame',
}

export default function FrameCard({ product, priority = false }: FrameCardProps) {
  const heroImg     = product.images.find(i => i.role === 'hero') ?? product.images[0]
  const lowestPrice = Math.min(...product.variants.map(v => v.basePricePaise))
  const href        = `/collections/${product.collectionSlug}?frame=${product.slug}`
  const seriesLabel = COLLECTION_LABEL[product.collectionSlug] ?? product.collectionSlug

  return (
    <div className="group relative block">
      {/* ── Image container ── */}
      <Link href={href} className="block focus:outline-none">
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-ivory-200 mb-5">
          {heroImg && (
            <Image
              src={heroImg.url}
              alt={heroImg.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          )}

          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Stock badge */}
          {product.variants.every(v => v.stockQty === 0) && (
            <div className="absolute top-3 left-3 bg-ivory/90 backdrop-blur-sm px-3 py-1">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-pewter">Sold Out</span>
            </div>
          )}
          {product.variants.some(v => v.stockQty > 0 && v.stockQty <= 3) && (
            <div className="absolute top-3 left-3 bg-walnut/90 backdrop-blur-sm px-3 py-1">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory">Low Stock</span>
            </div>
          )}

          {/* Wishlist button — top right */}
          <div className="absolute top-3 right-3">
            <WishlistButton product={product} />
          </div>

          {/* Quick View — slides up from bottom on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <QuickViewTrigger product={product} />
          </div>
        </div>
      </Link>

      {/* ── Info ── */}
      <Link href={href} className="block focus:outline-none">
        <div className="flex flex-col gap-1.5 px-0.5">
          <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold">
            {seriesLabel}
          </span>

          <h3 className="font-display text-[clamp(18px,1.4vw,22px)] leading-snug text-obsidian relative w-fit">
            {product.name}
            <span className="absolute -bottom-0.5 left-0 h-[1px] bg-obsidian/40 w-0 group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          </h3>

          <p className="font-body text-[13px] text-pewter italic leading-relaxed line-clamp-1">
            {product.tagline}
          </p>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-obsidian/8">
            <div className="flex flex-col">
              <span className="font-body text-[10px] uppercase tracking-[0.15em] text-pewter">from</span>
              <span className="font-display text-[18px] text-obsidian">{formatPrice(lowestPrice)}</span>
            </div>
            <span className="font-body text-[11px] uppercase tracking-[0.18em] text-gold group-hover:tracking-[0.25em] transition-all duration-500">
              Explore →
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
