import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { getAllCollections, getCollectionBySlug } from '@/lib/services/collections'
import { getProductsByCollection } from '@/lib/services/products'
import CollectionProductZone from '@/components/product/CollectionProductZone'

// ── SSG ────────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const collections = await getAllCollections()
  return collections.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) return {}
  return {
    title: `${collection.title} | ODSArts`,
    description: collection.description,
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) notFound()

  const products = await getProductsByCollection(slug)

  return (
    <main className="bg-ivory min-h-screen">

      {/* ── Cinematic hero (kept from original) ── */}
      <section className="relative w-full h-[60vh] min-h-[480px] flex items-end justify-start overflow-hidden bg-obsidian">
        <Image
          src={collection.imageSrc}
          alt={collection.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/20 to-transparent" />

        <div className="relative z-10 px-8 md:px-16 pb-12 md:pb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-10 bg-gold/50" />
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
              Collection {collection.number}
            </span>
          </div>
          <h1 className="font-display text-[clamp(40px,5.5vw,80px)] leading-[1.05] tracking-[-0.02em] text-ivory">
            {collection.title.split(' ').slice(0, -1).join(' ')}{' '}
            <em className="italic text-gold not-italic">
              {collection.title.split(' ').at(-1)}
            </em>
          </h1>
        </div>
      </section>

      {/* ── Breadcrumb ── */}
      <nav className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.15em]">
        <Link href="/collections" className="text-pewter hover:text-obsidian transition-colors">Collections</Link>
        <span className="text-pewter/40">/</span>
        <span className="text-obsidian">{collection.title}</span>
      </nav>

      {/* ── Multi-product zone ── */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center font-body text-pewter">Loading frame...</div>}>
        <CollectionProductZone products={products} />
      </Suspense>

      {/* ── Narrative + Specs (full width, below the fold) ── */}
      <section className="py-24 md:py-32 px-6 max-w-4xl mx-auto text-center border-t border-obsidian/5">
        <h2 className="font-display text-[clamp(32px,3vw,48px)] leading-[1.2] tracking-[-0.01em] text-obsidian mb-10">
          A Masterclass in <br />
          <span className="italic text-walnut">Materials and Light.</span>
        </h2>
        <div className="w-12 h-[1px] bg-gold mx-auto mb-10" />
        <p className="font-body text-[clamp(16px,1.2vw,18px)] leading-[2] text-pewter-dark">
          {collection.longDescription}
        </p>
      </section>

      {/* ── Materials + Features grid ── */}
      <section className="py-20 bg-ivory-200 border-t border-b border-obsidian/5">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold">01</span>
              <h3 className="font-display text-2xl text-obsidian">Materials</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {collection.materials.map((m, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                  <span className="font-body text-[14px] text-pewter-dark">{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-8">
              <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold">02</span>
              <h3 className="font-display text-2xl text-obsidian">Signature Details</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {collection.features.map((f, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                  <span className="font-body text-[14px] text-pewter-dark">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Custom framing CTA ── */}
      <section className="py-24 text-center">
        <p className="font-body text-[12px] uppercase tracking-[0.2em] text-pewter mb-6">
          Need something different?
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
