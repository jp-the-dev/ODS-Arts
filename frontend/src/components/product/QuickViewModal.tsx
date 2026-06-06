'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Product } from '@/lib/types/product'
import ProductConfigurator from '@/components/product/ProductConfigurator'

interface QuickViewModalProps {
  product: Product
  onClose: () => void
}

const COLLECTION_LABEL: Record<string, string> = {
  'box-frame':     'Box Frame',
  'gallery-frame': 'Gallery Frame',
  'glass-frame':   'Glass Frame',
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const heroImg = product.images.find((i) => i.role === 'hero') ?? product.images[0]
  const lifestyleImg = product.images.find((i) => i.role === 'lifestyle')

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="qv-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[300]"
        style={{ background: 'rgba(14,13,11,0.7)', backdropFilter: 'blur(6px)' }}
      />

      {/* Modal panel */}
      <motion.div
        key="qv-modal"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-[301] bg-ivory overflow-hidden"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 960px)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center text-obsidian/50 hover:text-obsidian transition-colors focus:outline-none"
          aria-label="Close quick view"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>

        {/* 2-column layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* Left — images */}
          <div
            className="relative md:w-[44%] flex-shrink-0 bg-ivory-200 overflow-hidden"
            style={{ minHeight: '280px' }}
          >
            {/* Hero image */}
            {heroImg && (
              <Image
                src={heroImg.url}
                alt={heroImg.alt}
                fill
                sizes="(max-width: 768px) 90vw, 420px"
                className="object-cover"
                priority
              />
            )}

            {/* Lifestyle thumbnail — bottom-left */}
            {lifestyleImg && (
              <div
                className="absolute bottom-4 left-4 w-20 h-24 border-2 border-ivory overflow-hidden"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
              >
                <Image
                  src={lifestyleImg.url}
                  alt={lifestyleImg.alt}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Collection eyebrow on image */}
            <div className="absolute top-4 left-4 bg-ivory/90 backdrop-blur-sm px-3 py-1.5">
              <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold">
                {COLLECTION_LABEL[product.collectionSlug] ?? product.collectionSlug}
              </span>
            </div>
          </div>

          {/* Right — configurator */}
          <div className="flex-1 overflow-y-auto p-7 md:p-10">
            <ProductConfigurator product={product} />

            {/* Full details link */}
            <div className="mt-8 pt-6 border-t border-obsidian/8">
              <Link
                href={`/collections/${product.collectionSlug}?frame=${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-pewter hover:text-obsidian transition-colors"
              >
                View full product details
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
