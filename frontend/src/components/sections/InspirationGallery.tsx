'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '@/components/layout/Container'

type Category = 'All' | 'Minimalist' | 'Warm & Organic' | 'Gallery Wall' | 'Workspace'

interface GalleryItem {
  id: string
  src: string
  category: Category
  title: string
  aspectRatio: string
}

const CATEGORIES: Category[] = ['All', 'Minimalist', 'Warm & Organic', 'Gallery Wall', 'Workspace']

const GALLERY_DATA: GalleryItem[] = [
  { id: '1', src: '/images/inspiration/minimal.png', category: 'Minimalist', title: 'The Walnut Series in a Minimalist Home', aspectRatio: 'aspect-[4/5]' },
  { id: '2', src: '/images/inspiration/warm.png', category: 'Warm & Organic', title: 'Oak Frame on Limewash', aspectRatio: 'aspect-square' },
  { id: '3', src: '/images/inspiration/gallery.png', category: 'Gallery Wall', title: 'Curated Hallway Collection', aspectRatio: 'aspect-[3/4]' },
  { id: '4', src: '/images/inspiration/workspace.png', category: 'Workspace', title: 'Creative Studio with Black Oak', aspectRatio: 'aspect-video' },
  // Duplicate for visual volume
  { id: '5', src: '/images/inspiration/warm.png', category: 'Warm & Organic', title: 'Wabi-Sabi Corner', aspectRatio: 'aspect-[4/5]' },
  { id: '6', src: '/images/inspiration/workspace.png', category: 'Workspace', title: 'Architectural Office', aspectRatio: 'aspect-square' },
  { id: '7', src: '/images/inspiration/minimal.png', category: 'Minimalist', title: 'Mid-Century Modern Living', aspectRatio: 'aspect-video' },
  { id: '8', src: '/images/inspiration/gallery.png', category: 'Gallery Wall', title: 'Moody Painted Gallery', aspectRatio: 'aspect-[4/5]' },
]

export default function InspirationGallery() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filteredItems = GALLERY_DATA.filter(
    item => activeCategory === 'All' || item.category === activeCategory
  )

  return (
    <section className="bg-ivory w-full pt-16 pb-32">
      <Container size="full" className="px-4 md:px-8">
        
        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-16">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="relative px-2 py-1 font-body text-[11px] uppercase tracking-[0.2em] transition-colors duration-300"
              style={{
                color: activeCategory === category ? '#0E0D0B' : '#8B8680',
              }}
            >
              {category}
              {activeCategory === category && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute left-0 right-0 -bottom-2 h-[1px] bg-gold"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`relative w-full ${item.aspectRatio} overflow-hidden group break-inside-avoid bg-obsidian/5`}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 md:p-8">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="block font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-2">
                      {item.category}
                    </span>
                    <h3 className="font-display text-2xl text-ivory leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </Container>
    </section>
  )
}
