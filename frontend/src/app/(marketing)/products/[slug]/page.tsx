import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getAllProducts } from '@/lib/services/products'
import { BRAND } from '@/constants'
import ProductConfigurator from '@/components/product/ProductConfigurator'

interface Props {
  params: Promise<{ slug: string }>
}

const COLLECTION_LABEL: Record<string, string> = {
  walnut: 'Walnut Series',
  gallery: 'Gallery Series',
  heritage: 'Heritage Collection',
}

/**
 * `dynamicParams` is deliberately left at its default (true).
 *
 * Setting it false would make an unknown slug return a true 404 instead of the
 * current soft 404 (the not-found page served with HTTP 200, because Next caches
 * the notFound() result as a prerendered page under ISR). But it would also make
 * any product added in the admin after the last build unreachable — the listing
 * revalidates hourly and would link to a page that 404s until a redeploy.
 *
 * A few junk URLs answering 200 is the smaller problem than real products being
 * invisible, so the soft 404 stands until the catalogue has deploy-on-publish.
 */
export async function generateStaticParams() {
  const products = await getAllProducts()

  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) return {}

  const hero = product.images.find((i) => i.role === 'hero') ?? product.images[0]

  return {
    title: `${product.name} | ODSArts`,
    description: product.tagline || product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | ODSArts`,
      description: product.tagline || product.description.slice(0, 160),
      type: 'website',
      images: hero ? [{ url: hero.url, alt: hero.alt }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const all = await getAllProducts()
  const related = all
    .filter((p) => p.collectionSlug === product.collectionSlug && p.slug !== product.slug)
    .slice(0, 3)

  const heroImg = product.images.find((i) => i.role === 'hero') ?? product.images[0]
  const detailImgs = product.images.filter((i) => i.role !== 'hero').slice(0, 2)
  const seriesLabel = COLLECTION_LABEL[product.collectionSlug] ?? product.collectionSlug
  const lowestPrice = Math.min(...product.variants.map((v) => v.basePricePaise)) / 100
  const inStock = product.variants.some((v) => v.stockQty > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: heroImg ? `${BRAND.url}${heroImg.url}` : undefined,
    sku: product.variants[0]?.sku,
    material: product.materials[0],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: lowestPrice,
      offerCount: product.variants.length,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    brand: { '@type': 'Brand', name: BRAND.name },
  }

  return (
    <main className="bg-ivory min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.18em] text-pewter mb-10">
          <Link href="/products" className="hover:text-obsidian transition-colors">
            Frames
          </Link>
          <span>/</span>
          <Link
            href={`/collections/${product.collectionSlug}`}
            className="hover:text-obsidian transition-colors"
          >
            {seriesLabel}
          </Link>
          <span>/</span>
          <span className="text-obsidian">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* ── Left: imagery ── */}
          <div className="flex flex-col gap-4">
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

            {detailImgs.length > 0 && (
              <div className="flex gap-4">
                {detailImgs.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-40 aspect-[4/5] overflow-hidden bg-ivory-200 border-2 border-ivory"
                  >
                    <Image src={img.url} alt={img.alt} fill sizes="160px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <p className="font-body text-[11px] text-pewter/60 italic mt-2">
              Photographed in natural light. Grain and tone vary slightly between pieces —
              each frame is cut from solid stock.
            </p>
          </div>

          {/* ── Right: configurator ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductConfigurator product={product} />
          </div>
        </div>
      </div>

      {/* ── Related frames ── */}
      {related.length > 0 && (
        <section className="border-t border-obsidian/8 pt-16 pb-24 max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] w-10 bg-gold/40" />
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
              More from the {seriesLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {related.map((item) => {
              const img = item.images.find((i) => i.role === 'hero') ?? item.images[0]

              return (
                <Link key={item.slug} href={`/products/${item.slug}`} className="group block">
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
                  <span className="font-display text-[16px] text-obsidian block">{item.name}</span>
                  <span className="font-body text-[12px] text-pewter italic">{item.tagline}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
