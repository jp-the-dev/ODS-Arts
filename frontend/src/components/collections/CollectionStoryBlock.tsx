'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ANIMATIONS } from '@/lib/config/animations'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export interface CollectionStoryBlockProps {
  number: string
  eyebrow: string
  title: string
  description: string
  materials: string[]
  imageSrc: string
  imageAlt: string
  linkHref: string
  imagePosition?: 'left' | 'right'
}

export default function CollectionStoryBlock({
  number,
  eyebrow,
  title,
  description,
  materials,
  imageSrc,
  imageAlt,
  linkHref,
  imagePosition = 'left',
}: CollectionStoryBlockProps) {
  
  const isImageRight = imagePosition === 'right'

  // Native IO reveal — direct DOM manipulation
  const revealRef = useScrollReveal<HTMLElement>({ threshold: 0.08 })
  const imageRevealRef = useScrollReveal<HTMLDivElement>({ threshold: 0.08, duration: 1200 })
  const contentRevealRef = useScrollReveal<HTMLDivElement>({ threshold: 0.08, delay: 150 })

  // Scroll parallax on the image using the same ref as the reveal
  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [-30, 30])

  return (
    <article
      ref={revealRef}
      className={`flex flex-col ${isImageRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24 lg:gap-32 w-full py-16 md:py-32`}
    >
      
      {/* ── Image Column ── */}
      <div
        ref={imageRevealRef}
        className="w-full md:w-[55%] lg:w-[60%] relative group overflow-hidden"
      >
        <motion.div 
          style={{ y: imageY }}
          className="aspect-[4/5] md:aspect-[3/4] relative bg-ivory-200"
        >
          <motion.div
            className="w-full h-full will-change-transform"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 1.2, ease: ANIMATIONS.ease.luxury }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 shadow-inner pointer-events-none" />
        </motion.div>
      </div>

      {/* ── Content Column ── */}
      <div
        ref={contentRevealRef}
        className="w-full md:w-[45%] lg:w-[40%] flex flex-col items-center text-center md:items-start md:text-left"
      >
        <span className="font-display text-[80px] leading-[0.8] text-gold/20 mb-12 select-none">
          {number}
        </span>
        
        <div className="flex items-center gap-4 mb-8">
          {!isImageRight && <div className="h-[1px] w-8 bg-gold/50 hidden md:block" />}
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
            {eyebrow}
          </span>
          <div className="h-[1px] w-8 bg-gold/50" />
        </div>

        <h3 className="font-display text-[clamp(40px,4vw,64px)] leading-[1.05] tracking-[-0.02em] text-obsidian mb-8">
          {title.split(' ').map((word, i, arr) => {
            if (i === arr.length - 1) {
              return <span key={i} className="italic text-walnut">{word}</span>
            }
            return <span key={i}>{word} </span>
          })}
        </h3>

        <div className="w-8 h-[1px] bg-gold/50 mb-8 md:hidden" />

        <p className="font-body text-[clamp(15px,1.2vw,17px)] leading-[1.8] text-pewter-dark max-w-sm mb-12">
          {description}
        </p>

        <div className="mb-14 w-full">
          <span className="block font-body text-[10px] uppercase tracking-[0.25em] text-obsidian/40 mb-4">
            Materials
          </span>
          <ul className="flex flex-col gap-2">
            {materials.map((material, idx) => (
              <li key={idx} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-[4px] h-[4px] rounded-full bg-gold/40" />
                <span className="font-body text-[12px] uppercase tracking-[0.15em] text-obsidian/70">
                  {material}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={linkHref}
          className="group inline-flex items-center gap-3 font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border-b border-obsidian/20 hover:border-obsidian pb-1 transition-all duration-400"
        >
          Explore Series
          <span className="transform transition-transform duration-400 group-hover:translate-x-2">→</span>
        </Link>
      </div>
    </article>
  )
}
