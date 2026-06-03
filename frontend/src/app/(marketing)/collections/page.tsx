import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { COLLECTIONS } from '@/lib/data/collections'
import { getAllProducts } from '@/lib/services/products'
import FrameGrid from '@/components/product/FrameGrid'

export const metadata: Metadata = {
  title: 'All Collections | ODSArts',
  description: 'Explore every frame in the ODSArts collection. Filter by series and sort by price to find the perfect frame for your artwork.',
}

export default async function CollectionsPage() {
  // Single fetch — all 9 products passed to the client grid component
  const products = await getAllProducts()

  return (
    <main className="bg-ivory min-h-screen">

      {/* ══════════════════════════════════════════════════════════════
          ZONE 1 — CINEMATIC HEADER
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-24 md:pt-52 md:pb-32 px-6 text-center overflow-hidden">
        {/* Gold radial bloom */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,169,110,0.10) 0%, transparent 65%)' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-14 bg-gold/50" />
            <span className="font-body text-[10px] uppercase tracking-[0.35em] text-gold">
              The Complete Directory
            </span>
            <div className="h-[1px] w-14 bg-gold/50" />
          </div>

          <h1 className="font-display text-[clamp(44px,5.5vw,80px)] leading-[1.03] tracking-[-0.025em] text-obsidian mb-8">
            Every Frame. <em className="italic text-walnut not-italic">Every Series.</em>
          </h1>

          <p className="font-body text-[clamp(15px,1.2vw,17px)] leading-[1.9] text-pewter-dark max-w-xl">
            Three collections. Nine distinct profiles. Each one an architectural philosophy in wood, metal, or gilded craft.
            From ₹5,499 to bespoke commissions.
          </p>

          {/* Stat row */}
          <div className="mt-14 flex items-center gap-12 md:gap-20">
            {[
              { num: '3',  label: 'Collections' },
              { num: '9',  label: 'Frame Profiles' },
              { num: '4',  label: 'Sizes Each'    },
              { num: '14', label: 'Day Delivery'  },
            ].map(({ num, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="font-display text-[clamp(28px,2.5vw,40px)] text-obsidian">{num}</span>
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-pewter">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ZONE 2 — SERIES BANDS (3 compact editorial strips)
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-obsidian/6">
        {COLLECTIONS.map((collection, idx) => {
          const isEven = idx % 2 === 0
          const seriesProducts = products.filter(p => p.collectionSlug === collection.slug)
          const lowestAny = seriesProducts.length
            ? Math.min(...seriesProducts.flatMap(p => p.variants.map(v => v.basePricePaise)))
            : null

          return (
            <div
              key={collection.slug}
              className={`grid grid-cols-1 md:grid-cols-2 border-b border-obsidian/6 ${isEven ? '' : 'md:[direction:rtl]'}`}
            >
              {/* Image side */}
              <div className={`relative h-[320px] md:h-[440px] overflow-hidden group ${isEven ? '' : 'md:[direction:ltr]'}`}>
                <Image
                  src={collection.imageSrc}
                  alt={collection.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent" />
              </div>

              {/* Text side */}
              <div className={`flex flex-col justify-center px-8 md:px-14 py-12 md:py-16 ${isEven ? '' : 'md:[direction:ltr]'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold/70">
                    {collection.number}
                  </span>
                  <div className="h-[1px] flex-1 bg-gold/20" />
                </div>

                <span className="font-body text-[10px] uppercase tracking-[0.28em] text-gold mb-4">
                  {collection.eyebrow}
                </span>

                <h2 className="font-display text-[clamp(28px,2.8vw,44px)] leading-[1.1] tracking-tight text-obsidian mb-5">
                  {collection.title}
                </h2>

                <p className="font-body text-[14px] leading-[1.9] text-pewter-dark mb-8 max-w-sm">
                  {collection.description}
                </p>

                {/* Series stats */}
                <div className="flex items-center gap-6 mb-8">
                  <div>
                    <span className="font-display text-xl text-obsidian">{seriesProducts.length}</span>
                    <span className="font-body text-[11px] text-pewter ml-2 uppercase tracking-[0.1em]">Profiles</span>
                  </div>
                  {lowestAny && (
                    <>
                      <div className="w-[1px] h-6 bg-obsidian/10" />
                      <div>
                        <span className="font-body text-[10px] text-pewter uppercase tracking-[0.1em]">From </span>
                        <span className="font-display text-xl text-obsidian">
                          ₹{Math.round(lowestAny / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="w-[1px] h-6 bg-obsidian/10" />
                  <div>
                    <span className="font-body text-[11px] text-pewter uppercase tracking-[0.1em]">
                      {collection.materials[0]}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/collections/${collection.slug}`}
                  className="group/btn inline-flex items-center gap-3 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 w-fit hover:bg-walnut transition-colors duration-500"
                >
                  Explore {collection.title.split(' ').pop()} Series
                  <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          )
        })}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ZONE 3 — COMPLETE FRAME GRID (All 9 frames)
      ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-[1px] w-10 bg-gold/50" />
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
                The Complete Selection
              </span>
            </div>
            <h2 className="font-display text-[clamp(32px,3.5vw,52px)] leading-[1.1] tracking-tight text-obsidian">
              All{' '}
              <span className="italic text-walnut">{products.length}</span>{' '}
              Frames
            </h2>
          </div>
          <p className="font-body text-[14px] text-pewter max-w-xs leading-relaxed">
            Filter by collection series or sort by price to discover the frame that speaks to your space.
          </p>
        </div>

        {/* Client-side filterable grid — receives all products from server */}
        <FrameGrid products={products} />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ZONE 4 — BOTTOM CTA BAND
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-obsidian/6 py-20 px-6 text-center">
        <p className="font-body text-[12px] uppercase tracking-[0.25em] text-pewter mb-5">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <h2 className="font-display text-[clamp(28px,3vw,44px)] leading-[1.1] text-obsidian mb-8">
          Commission a <em className="italic text-walnut not-italic">Custom Frame</em>
        </h2>
        <p className="font-body text-[15px] text-pewter-dark max-w-md mx-auto mb-10 leading-relaxed">
          Every artwork is unique. We build to your exact dimensions, matting preferences, and finish requirements.
        </p>
        <Link
          href="/custom-framing"
          className="inline-flex items-center gap-3 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:bg-walnut transition-colors duration-500"
        >
          Start a Custom Commission
        </Link>
      </section>

    </main>
  )
}
