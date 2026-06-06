'use client'

/**
 * ArtCollectionTeaser — Homepage section
 *
 * Stays on the ivory/linen colour family (consistent with the rest of homepage).
 * The art vertical is distinguished by a warm-tinted background strip, a large
 * editorial eyebrow, and a cinematic full-width scrolling card tray — NOT by
 * switching to a dark palette (which felt jarring as a hard cut).
 *
 * Animation rules (agents/13-framer-motion-guidelines.md):
 * - Entry reveals: useScrollReveal (IO direct DOM — back-nav safe)
 * - Image hover: Framer Motion whileHover only
 * - Strip drag: Framer Motion drag="x"
 */

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { ART_CATEGORIES } from '@/lib/data/artCategories'
import { ANIMATIONS } from '@/lib/config/animations'

export default function ArtCollectionTeaser() {
  const headerRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, delay: 0 })
  const stripRef  = useScrollReveal<HTMLDivElement>({ threshold: 0.05, delay: 100 })
  const ctaRef    = useScrollReveal<HTMLDivElement>({ threshold: 0.1, delay: 200 })

  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <section
      className="relative overflow-hidden"
      aria-label="Art Collection"
      style={{ background: '#EDE8DF' }} /* warm linen — one tone darker than ivory #F5F0E8 */
    >
      {/* ── Subtle top edge blend from ivory ── */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, #F5F0E8, transparent)' }}
      />
      {/* ── Subtle bottom edge blend back to ivory ── */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, #F5F0E8, transparent)' }}
      />

      {/* ── Very faint gold bloom top-left ── */}
      <div
        aria-hidden
        className="absolute top-0 left-0 w-[800px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(201,169,110,0.09) 0%, transparent 65%)' }}
      />

      <div className="relative z-20 pt-28 pb-32 md:pt-36 md:pb-44">

        {/* ── Section Header ── */}
        <div
          ref={headerRef}
          className="max-w-7xl mx-auto px-6 md:px-10 mb-16 md:mb-24"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            {/* Left */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] w-10 bg-gold/50" />
                <span className="font-body text-[10px] uppercase tracking-[0.35em] text-gold">
                  Art Collection · Now Available
                </span>
              </div>
              <h2 className="font-display text-[clamp(36px,4.5vw,68px)] leading-[1.04] tracking-[-0.02em] text-obsidian">
                Original prints,{' '}
                <em className="italic text-walnut">
                  museum-grade.
                </em>
              </h2>
            </div>

            {/* Right — description + CTA */}
            <div className="flex flex-col items-start md:items-end gap-5 max-w-sm shrink-0">
              <p className="font-body text-[clamp(14px,1.1vw,16px)] leading-[1.85] text-pewter-dark md:text-right">
                Six curated art genres — canvas, photo paper, fine art giclée.
                Never mass produced. Printed to order.
              </p>
              <Link
                href="/art"
                className="group inline-flex items-center gap-3 font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border-b border-obsidian/25 hover:border-obsidian pb-[2px] transition-all duration-400"
              >
                Explore All Art
                <span className="transform transition-transform duration-400 group-hover:translate-x-1.5">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Draggable Category Card Strip ── */}
        <div ref={stripRef} className="relative">
          {/* Left fade mask using linen colour */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 md:w-16 z-10"
            style={{ background: 'linear-gradient(to right, #EDE8DF, transparent)' }}
          />
          {/* Right fade mask */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 md:w-16 z-10"
            style={{ background: 'linear-gradient(to left, #EDE8DF, transparent)' }}
          />

          {/* Drag track */}
          <div ref={trackRef} className="overflow-hidden">
            <motion.div
              drag="x"
              dragConstraints={trackRef}
              dragElastic={0.06}
              className="flex gap-4 md:gap-5 px-6 md:px-16 cursor-grab active:cursor-grabbing select-none"
              style={{ width: 'max-content' }}
            >
              {ART_CATEGORIES.map((cat, i) => (
                <ArtCategoryCard key={cat.slug} cat={cat} index={i} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Bottom row: category links + CTA ── */}
        <div
          ref={ctaRef}
          className="max-w-7xl mx-auto px-6 md:px-10 mt-12 md:mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          {/* Category pill links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {ART_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/art/${cat.slug}`}
                className="font-body text-[10px] uppercase tracking-[0.2em] text-obsidian/35 hover:text-gold transition-colors duration-300"
              >
                {cat.title.split(' ')[0]}
              </Link>
            ))}
          </div>

          <Link
            href="/art"
            className="inline-flex items-center gap-3 bg-obsidian text-ivory hover:bg-walnut font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 transition-colors duration-500 shrink-0"
          >
            View All Art Prints
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: individual category card
// ─────────────────────────────────────────────────────────────────────────────

interface ArtCategoryCardProps {
  cat: (typeof ART_CATEGORIES)[number]
  index: number
}

function ArtCategoryCard({ cat, index }: ArtCategoryCardProps) {
  const cardRef = useScrollReveal<HTMLDivElement>({
    threshold: 0.05,
    delay: index * 70,
    duration: 800,
    y: 18,
  })

  return (
    <div ref={cardRef}>
      <Link
        href={`/art/${cat.slug}`}
        draggable={false}
        className="group relative block"
        style={{ width: 'clamp(200px, 22vw, 270px)', flexShrink: 0 }}
      >
        {/* Portrait image container */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: '3/4' }}
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 1.1, ease: ANIMATIONS.ease.luxury }}
          >
            <Image
              src={cat.coverImage}
              alt={cat.coverImageAlt}
              fill
              sizes="(max-width: 640px) 210px, 270px"
              className="object-cover"
              draggable={false}
            />
          </motion.div>

          {/* Dark gradient for text legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(14,13,11,0.90) 0%, rgba(14,13,11,0.20) 45%, rgba(14,13,11,0.0) 70%)',
            }}
          />

          {/* Number badge top-left */}
          <span className="absolute top-4 left-4 font-body text-[10px] uppercase tracking-[0.3em] text-ivory/40">
            {cat.number}
          </span>

          {/* Category info — bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="block font-body text-[8px] uppercase tracking-[0.3em] text-gold/80 mb-1.5">
              {cat.eyebrow}
            </span>
            <span className="block font-display text-[clamp(17px,1.7vw,21px)] leading-[1.15] text-ivory">
              {cat.title}
            </span>
            {/* Underline reveal on hover */}
            <div className="mt-2.5 h-[1px] bg-gold/0 group-hover:bg-gold/50 transition-all duration-500 w-0 group-hover:w-full" />
          </div>
        </div>

        {/* Tagline below image — on linen bg */}
        <p className="font-body text-[11px] leading-[1.65] text-obsidian/45 mt-3 pr-2 italic">
          {cat.tagline}
        </p>
      </Link>
    </div>
  )
}
