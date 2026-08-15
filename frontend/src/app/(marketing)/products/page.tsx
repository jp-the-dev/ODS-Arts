import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllProducts } from '@/lib/services/products'
import FrameGrid from '@/components/product/FrameGrid'

export const metadata: Metadata = {
  title: 'All Frames | ODSArts',
  description:
    'Every ODSArts frame in one place — solid walnut, gallery aluminium and heritage glass profiles, handmade to order with museum-grade materials.',
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'All Frames | ODSArts',
    description:
      'Every ODSArts frame in one place, handmade to order with museum-grade materials.',
    type: 'website',
  },
}

// Revalidate hourly — the catalogue changes rarely, filtering happens client-side.
export const revalidate = 3600

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <main className="bg-ivory min-h-screen">
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] w-10 bg-gold/40" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
            The Full Collection
          </span>
        </div>

        <h1 className="font-display text-[clamp(36px,5vw,64px)] text-obsidian leading-[1.05] mb-5">
          Every frame we make.
        </h1>

        <p className="font-body text-[15px] leading-[1.8] text-pewter-dark max-w-xl">
          {products.length} profiles across our walnut, gallery and heritage series —
          each cut, joined and finished by hand in our studio. Filter by collection,
          size or price to find the one your photograph deserves.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        {/* FrameGrid reads filter state from the URL, so it needs a Suspense
            boundary for useSearchParams during prerender. */}
        <Suspense
          fallback={
            <div className="py-24 text-center font-body text-[13px] text-pewter">
              Loading frames…
            </div>
          }
        >
          <FrameGrid products={products} linkTo="pdp" />
        </Suspense>
      </section>
    </main>
  )
}
