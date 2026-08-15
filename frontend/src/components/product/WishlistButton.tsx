'use client'

import { motion } from 'framer-motion'
import { useWishlist } from '@/lib/store/wishlist'
import type { Product } from '@/lib/types/product'

interface WishlistButtonProps {
  product: Product
  /** For art prints — pass the art slug; overrides product.slug */
  artSlug?: string
  /** 'icon' for card overlay (default), 'full' for product page inline row */
  variant?: 'icon' | 'full'
}

export default function WishlistButton({ product, artSlug, variant = 'icon' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const slug   = artSlug ?? product.slug
  const active = isInWishlist(slug)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(slug, artSlug ? 'art' : 'frame')
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2.5 font-body text-[11px] uppercase tracking-[0.2em] text-pewter-dark hover:text-obsidian transition-colors focus:outline-none group"
      >
        <HeartIcon active={active} />
        <span>{active ? 'Saved' : 'Save to Wishlist'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-8 h-8 flex items-center justify-center bg-ivory/90 backdrop-blur-sm hover:bg-ivory transition-colors focus:outline-none"
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <HeartIcon active={active} />
    </button>
  )
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <motion.svg
      width="14" height="13" viewBox="0 0 14 13" fill="none"
      animate={{ scale: active ? [1, 1.25, 1] : 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.path
        d="M7 11.5C7 11.5 1 7.5 1 4C1 2.343 2.343 1 4 1C5.054 1 5.982 1.528 6.5 2.344C7.018 1.528 7.946 1 9 1C10.657 1 12 2.343 12 4C12 7.5 7 11.5 7 11.5Z"
        stroke={active ? '#C9A96E' : 'currentColor'}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ fill: active ? 'rgba(201,169,110,0.85)' : 'transparent' }}
        transition={{ duration: 0.25 }}
        className={active ? '' : 'text-obsidian/60'}
      />
    </motion.svg>
  )
}
