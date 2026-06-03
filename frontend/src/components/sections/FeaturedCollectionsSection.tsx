import CollectionStoryBlock from '@/components/collections/CollectionStoryBlock'

import { COLLECTIONS } from '@/lib/data/collections'

export default function FeaturedCollectionsSection() {
  return (
    <section className="bg-ivory w-full relative overflow-hidden py-24 md:py-32">
      
      {/* ── Section Header ── */}
      <div className="max-w-7xl mx-auto px-6 mb-16 md:mb-24 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
              Curated Selection
            </span>
            <div className="h-[1px] w-12 bg-gold/50" />
          </div>
          <h2 className="font-display text-[clamp(32px,4vw,56px)] leading-[1.1] tracking-[-0.02em] text-obsidian">
            Featured <span className="italic text-walnut">Collections</span>
          </h2>
        </div>
        <p className="font-body text-[clamp(14px,1.1vw,16px)] text-pewter-dark max-w-sm">
          Discover our signature frames, each crafted with a distinct philosophy to honor your most cherished moments.
        </p>
      </div>

      {/* ── Collections ── */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12 md:gap-0">
        {COLLECTIONS.map((collection, index) => (
          <div key={collection.number}>
            <CollectionStoryBlock 
              {...collection} 
              linkHref={`/collections/${collection.slug}`}
            />
            {/* Elegant divider between blocks on mobile, or just whitespace on desktop */}
            {index !== COLLECTIONS.length - 1 && (
              <div className="w-full flex justify-center md:hidden my-8">
                <div className="w-12 h-[1px] bg-gold/30" />
              </div>
            )}
          </div>
        ))}
      </div>

    </section>
  )
}
