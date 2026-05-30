import CollectionStoryBlock from '@/components/collections/CollectionStoryBlock'

const COLLECTIONS = [
  {
    number: '01',
    eyebrow: 'Signature Wood',
    title: 'The Walnut Series',
    description: 'Crafted from rich natural walnut, designed for timeless family portraits and heirloom memories. The warmth of the wood perfectly complements both black-and-white and color photography.',
    materials: ['Solid Walnut', 'Museum Glass', 'Acid-Free Mat'],
    imageSrc: '/images/collections/walnut.png',
    imageAlt: 'Close up of a luxury walnut wood picture frame',
    linkHref: '/collections/walnut',
    imagePosition: 'left' as const,
  },
  {
    number: '02',
    eyebrow: 'Minimalist Architecture',
    title: 'The Gallery Series',
    description: 'Ultra-thin, structural, and unapologetically modern. The Gallery Series uses powder-coated aluminum to let your artwork or photography speak entirely for itself.',
    materials: ['Brushed Aluminum', 'UV-Protective Acrylic', 'Floating Mount'],
    imageSrc: '/images/collections/gallery.png',
    imageAlt: 'A minimalist gallery wall with multiple thin black frames',
    linkHref: '/collections/gallery',
    imagePosition: 'right' as const,
  },
  {
    number: '03',
    eyebrow: 'Vintage Opulence',
    title: 'The Heritage Collection',
    description: 'Ornate, gilded, and meticulously detailed. The Heritage Collection brings museum-quality grandeur into your home, perfect for classical paintings or bold statement portraiture.',
    materials: ['Hand-Gilded Gold', 'Archival Backing', 'Beveled Matting'],
    imageSrc: '/images/collections/heritage.png',
    imageAlt: 'A beautiful vintage ornate gold heritage picture frame',
    linkHref: '/collections/heritage',
    imagePosition: 'left' as const,
  },
]

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
            <CollectionStoryBlock {...collection} />
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
