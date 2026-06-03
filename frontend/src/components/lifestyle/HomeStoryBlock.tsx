'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export interface HomeStoryBlockProps {
  imageSrc: string
  imageAlt: string
  location: string
  spaceName: string
  story: string
  clientName: string
}

export default function HomeStoryBlock({
  imageSrc,
  imageAlt,
  location,
  spaceName,
  story,
  clientName,
}: HomeStoryBlockProps) {
  
  const containerRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [-40, 40])

  // Direct DOM reveal — no React state, no timing dependency
  const imageRevealRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, duration: 1200 })
  const captionRevealRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, delay: 200 })

  return (
    <article
      ref={(el) => {
        ;(containerRef as React.MutableRefObject<HTMLElement | null>).current = el
      }}
      className="w-full flex flex-col items-center mb-32 md:mb-48 last:mb-0"
    >
      
      {/* ── Magazine-style Image Container ── */}
      <div
        ref={imageRevealRef}
        className="w-full max-w-[1200px] aspect-[4/3] md:aspect-[16/9] relative overflow-hidden bg-ivory-200 mb-12 md:mb-16"
      >
        <motion.div 
          style={{ y: imageY }}
          className="w-full h-full will-change-transform scale-110"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      {/* ── Editorial Story Caption ── */}
      <div 
        ref={captionRevealRef}
        className="w-full max-w-2xl px-6 flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-16"
      >
        <div className="flex flex-col gap-2 shrink-0 md:w-1/3">
          <span className="font-display text-[22px] leading-[1.2] text-obsidian">
            {spaceName}
          </span>
          <span className="font-body text-[11px] uppercase tracking-[0.25em] text-pewter-dark">
            {location}
          </span>
          <div className="w-8 h-[1px] bg-gold/40 mt-4" />
        </div>

        <div className="flex flex-col gap-4 md:w-2/3">
          <span className="font-body text-[11px] uppercase tracking-[0.25em] text-obsidian/40">
            {clientName}
          </span>
          <p className="font-display text-[clamp(20px,2vw,28px)] leading-[1.4] tracking-[-0.01em] italic text-obsidian">
            &ldquo;{story}&rdquo;
          </p>
        </div>
      </div>

    </article>
  )
}
