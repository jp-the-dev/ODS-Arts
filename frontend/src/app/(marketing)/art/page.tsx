import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { getAllArt } from '@/lib/services/art'
import { ART_CATEGORIES } from '@/lib/data/artCategories'
import ArtGrid from '@/components/art/ArtGrid'

export const metadata: Metadata = {
  title: 'Art Collection | ODSArts',
  description: 'Curated fine art prints across cultural, modern, nature, business, entertainment, and automotive themes. Printed on museum-grade materials.',
}

export default async function ArtHubPage() {
  const allArt = await getAllArt()

  return (
    <main className="bg-ivory min-h-screen">

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,169,110,0.1) 0%, transparent 65%)' }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-[1px] w-12 bg-gold/50" />
            <span className="font-body text-[10px] uppercase tracking-[0.35em] text-gold">
              ODSArts Collection
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <h1 className="font-display text-[clamp(42px,5vw,82px)] leading-[1.02] tracking-[-0.025em] text-obsidian mb-8">
                Art<br />
                <em className="italic text-walnut">Collection</em>
              </h1>
              <p className="font-body text-[16px] text-pewter leading-[1.9] max-w-xl">
                Six curated categories. Eighteen original artworks. Each print made to order on museum-grade materials — from canvas to giclée fine art paper. Never mass produced.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {ART_CATEGORIES.slice(0, 3).map((cat) => (
                <div key={cat.slug} className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={cat.coverImage}
                    alt={cat.coverImageAlt}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Category cards ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] flex-1 bg-obsidian/8" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">Browse by Category</span>
          <div className="h-[1px] flex-1 bg-obsidian/8" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ART_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/art/${cat.slug}`}
              className="group relative overflow-hidden aspect-[2/3] block"
            >
              <Image
                src={cat.coverImage}
                alt={cat.coverImageAlt}
                fill
                sizes="(max-width: 640px) 50vw, 200px"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
              />
              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.1) 60%)' }}
              />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="font-body text-[8px] uppercase tracking-[0.3em] text-gold/80 block mb-1">
                  {cat.eyebrow}
                </span>
                <span className="font-display text-[14px] text-ivory leading-tight block">
                  {cat.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-obsidian/8" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">All Prints</span>
          <div className="h-[1px] flex-1 bg-obsidian/8" />
        </div>
      </div>

      {/* ── Full grid ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-32">
        <Suspense fallback={<div className="py-24 text-center font-body text-pewter">Loading prints…</div>}>
          <ArtGrid initialArt={allArt} />
        </Suspense>
      </section>

    </main>
  )
}
