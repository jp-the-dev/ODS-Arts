import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArtBySlug, getArtByCategory } from '@/lib/services/art'
import { getArtCategory } from '@/lib/data/artCategories'
import { MOCK_ART } from '@/lib/mock/art'
import type { ArtStyle } from '@/lib/types/art'
import ArtConfigurator from '@/components/art/ArtConfigurator'

interface Props {
  params: Promise<{ categorySlug: string; artSlug: string }>
}

export async function generateStaticParams() {
  return MOCK_ART.map((a) => ({ categorySlug: a.categorySlug, artSlug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { artSlug } = await params
  const art = await getArtBySlug(artSlug)
  if (!art) return {}
  return {
    title: `${art.name} | ODSArts Art Collection`,
    description: art.tagline,
  }
}

export default async function ArtProductPage({ params }: Props) {
  const { categorySlug, artSlug } = await params
  const [art, categoryArt] = await Promise.all([
    getArtBySlug(artSlug),
    getArtByCategory(categorySlug as ArtStyle),
  ])
  if (!art) notFound()

  const cat = getArtCategory(art.categorySlug)
  const heroImg      = art.images.find((i) => i.role === 'hero') ?? art.images[0]
  const detailImg    = art.images.find((i) => i.role === 'detail')
  const relatedArt   = categoryArt.filter((a) => a.slug !== art.slug).slice(0, 3)

  return (
    <main className="bg-ivory min-h-screen">

      {/* ── 2-column layout ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.18em] text-pewter mb-10">
          <Link href="/art" className="hover:text-obsidian transition-colors">Art</Link>
          <span>/</span>
          {cat && (
            <>
              <Link href={`/art/${cat.slug}`} className="hover:text-obsidian transition-colors">
                {cat.title}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-obsidian">{art.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ── Left: Images ── */}
          <div className="flex flex-col gap-4">
            {/* Hero */}
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-ivory-200">
              {heroImg && (
                <Image
                  src={heroImg.url}
                  alt={heroImg.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>

            {/* Detail thumbnail */}
            {detailImg && (
              <div className="relative w-40 aspect-[4/5] overflow-hidden bg-ivory-200 border-2 border-ivory">
                <Image
                  src={detailImg.url}
                  alt={detailImg.alt}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Material note */}
            <p className="font-body text-[11px] text-pewter/60 italic mt-2">
              Images shown as Canvas Print. Actual appearance varies slightly by material.
            </p>
          </div>

          {/* ── Right: Configurator ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ArtConfigurator art={art} />
          </div>

        </div>
      </div>

      {/* ── Related prints ── */}
      {relatedArt.length > 0 && (
        <section className="border-t border-obsidian/8 pt-16 pb-24 max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] w-10 bg-gold/40" />
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
              More from {cat?.title ?? 'this collection'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedArt.map((related) => {
              const img = related.images[0]
              return (
                <Link key={related.slug} href={`/art/${related.categorySlug}/${related.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-ivory-200 mb-4">
                    {img && (
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-[1000ms]"
                      />
                    )}
                  </div>
                  <span className="font-display text-[16px] text-obsidian block">{related.name}</span>
                  <span className="font-body text-[12px] text-pewter italic">{related.tagline}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

    </main>
  )
}
