import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getArtByCategory } from '@/lib/services/art'
import { getArtCategory, ART_CATEGORIES } from '@/lib/data/artCategories'
import type { ArtStyle } from '@/lib/types/art'
import ArtGrid from '@/components/art/ArtGrid'

interface Props {
  params: Promise<{ categorySlug: string }>
}

export async function generateStaticParams() {
  return ART_CATEGORIES.map((c) => ({ categorySlug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params
  const cat = getArtCategory(categorySlug as ArtStyle)
  if (!cat) return {}
  return {
    title: `${cat.title} | ODSArts Art Collection`,
    description: cat.description,
  }
}

export default async function ArtCategoryPage({ params }: Props) {
  const { categorySlug } = await params
  const cat = getArtCategory(categorySlug as ArtStyle)
  if (!cat) notFound()

  const art = await getArtByCategory(cat.slug)

  return (
    <main className="bg-ivory min-h-screen">

      {/* ── Category hero ── */}
      <section className="relative h-[55vh] min-h-[380px] max-h-[560px] overflow-hidden">
        <Image
          src={cat.coverImage}
          alt={cat.coverImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(14,13,11,0.15) 0%, rgba(14,13,11,0.7) 100%)' }}
        />

        {/* Text */}
        <div className="absolute bottom-0 left-0 right-0 pb-12 px-6 md:px-10 max-w-7xl mx-auto w-full">
          <span className="font-body text-[9px] uppercase tracking-[0.35em] text-gold mb-4 block">
            {cat.number} · {cat.eyebrow}
          </span>
          <h1 className="font-display text-[clamp(36px,5vw,72px)] leading-[1.05] tracking-[-0.02em] text-ivory mb-4">
            {cat.title}
          </h1>
          <p className="font-body text-[15px] text-ivory/70 italic max-w-xl">
            {cat.tagline}
          </p>
        </div>
      </section>

      {/* ── Description + prints ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        {/* Category description */}
        <div className="max-w-2xl mb-14">
          <p className="font-body text-[15px] text-pewter leading-[1.9]">{cat.description}</p>
        </div>

        <Suspense fallback={<div className="py-24 text-center font-body text-pewter">Loading prints…</div>}>
          <ArtGrid initialArt={art} />
        </Suspense>
      </section>

    </main>
  )
}
