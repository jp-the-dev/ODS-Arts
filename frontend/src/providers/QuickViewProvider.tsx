'use client'

/**
 * ODSArts — Quick View Provider
 *
 * Manages which product (if any) is currently open in the Quick View modal.
 * Wrap the app root with <QuickViewProvider> and call openQuickView(product)
 * from any FrameCard to trigger the modal.
 */

import React, { createContext, useCallback, useContext, useState } from 'react'
import type { Product } from '@/lib/types/product'
import dynamic from 'next/dynamic'

// Lazy-load the modal so it doesn't bloat the initial bundle
const QuickViewModal = dynamic(
  () => import('@/components/product/QuickViewModal'),
  { ssr: false }
)

interface QuickViewContextValue {
  openQuickView: (product: Product) => void
  closeQuickView: () => void
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null)

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)

  const openQuickView  = useCallback((p: Product) => setActiveProduct(p), [])
  const closeQuickView = useCallback(() => setActiveProduct(null), [])

  return (
    <QuickViewContext.Provider value={{ openQuickView, closeQuickView }}>
      {children}
      {activeProduct && (
        <QuickViewModal product={activeProduct} onClose={closeQuickView} />
      )}
    </QuickViewContext.Provider>
  )
}

export function useQuickView(): QuickViewContextValue {
  const ctx = useContext(QuickViewContext)
  if (!ctx) throw new Error('useQuickView must be used inside <QuickViewProvider>')
  return ctx
}
