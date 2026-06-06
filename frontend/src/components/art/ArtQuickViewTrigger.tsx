'use client'

import type { ArtProduct } from '@/lib/types/art'

// Placeholder — ArtQuickViewProvider will be wired up in a follow-up.
// For now, button opens the full art product page.
import { useRouter } from 'next/navigation'

export default function ArtQuickViewTrigger({ art }: { art: ArtProduct }) {
  const router = useRouter()
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        router.push(`/art/${art.categorySlug}/${art.slug}`)
      }}
      className="w-full py-3 bg-obsidian/90 backdrop-blur-sm font-body text-[10px] uppercase tracking-[0.25em] text-ivory hover:bg-walnut transition-colors duration-300 focus:outline-none"
    >
      View Print
    </button>
  )
}
