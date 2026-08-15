'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductImage } from '@/lib/types/product'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Main image ── */}
      <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden bg-ivory-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt || productName}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              priority={activeIndex === 0}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Role badge */}
        {activeImage.role !== 'hero' && (
          <div className="absolute bottom-4 left-4 z-10 bg-ivory/80 backdrop-blur-sm px-3 py-1">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-obsidian/70">
              {activeImage.role === 'detail' ? 'Detail' : 'In Situ'}
            </span>
          </div>
        )}
      </div>

      {/* ── Thumbnail rail ── */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden transition-all duration-300 focus:outline-none ${
                idx === activeIndex
                  ? 'ring-2 ring-offset-2 ring-obsidian'
                  : 'ring-1 ring-transparent hover:ring-obsidian/30'
              }`}
              aria-label={`View ${img.alt}`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} — view ${idx + 1}`}
                fill
                sizes="96px"
                className={`object-cover transition-opacity duration-300 ${
                  idx === activeIndex ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
