'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product } from '@/lib/types/product'
import ProductSelector from '@/components/product/ProductSelector'
import ProductGallery from '@/components/product/ProductGallery'
import ProductConfigurator from '@/components/product/ProductConfigurator'

interface CollectionProductZoneProps {
  products: Product[]
}

/**
 * Client component that manages which product in the collection is selected.
 * Receives ALL products from the Server Component (one fetch, scales with API).
 */
export default function CollectionProductZone({ products }: CollectionProductZoneProps) {
  const searchParams = useSearchParams()
  const frameSlug = searchParams.get('frame')

  const [activeProduct, setActiveProduct] = useState<Product>(() => {
    if (frameSlug) {
      const match = products.find(p => p.slug === frameSlug)
      if (match) return match
    }
    return products[0]
  })

  const [prevFrameSlug, setPrevFrameSlug] = useState(frameSlug)

  // Sync state if URL changes while on page (derived state)
  if (frameSlug !== prevFrameSlug) {
    setPrevFrameSlug(frameSlug)
    if (frameSlug) {
      const match = products.find(p => p.slug === frameSlug)
      if (match && match.id !== activeProduct.id) {
        setActiveProduct(match)
      }
    }
  }

  if (products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-body text-pewter">Products coming soon. Contact us for availability.</p>
      </div>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
      
      {/* ── Product selector rail (only shown if >1 product) ── */}
      {products.length > 1 && (
        <ProductSelector
          products={products}
          selectedId={activeProduct.id}
          onSelect={setActiveProduct}
        />
      )}

      {/* ── 2-column: Gallery left, Configurator right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-12 xl:gap-20 items-start">

        {/* Left: sticky gallery */}
        <div className="lg:sticky lg:top-24">
          <ProductGallery
            key={activeProduct.id}
            images={activeProduct.images}
            productName={activeProduct.name}
          />
        </div>

        {/* Right: configurator */}
        <div>
          <ProductConfigurator
            key={activeProduct.id}
            product={activeProduct}
          />
        </div>

      </div>
    </section>
  )
}
