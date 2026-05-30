'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ANIMATIONS } from '@/lib/config/animations'

export interface HomeStoryBlockProps {
  imageSrc: string
  imageAlt: string
  location: string
  spaceName: string
  story: string
  clientName: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: ANIMATIONS.ease.luxury },
  },
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
  
  // Parallax strictly on the image container for luxury feel
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  
  const imageY = useTransform(scrollYProgress, [0, 1], [-40, 40])

  return (
    <article ref={containerRef} className="w-full flex flex-col items-center mb-32 md:mb-48 last:mb-0">
      
      {/* ── Magazine-style Image Container ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 1.2, ease: ANIMATIONS.ease.luxury }}
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
      </motion.div>

      {/* ── Editorial Story Caption ── */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        variants={{
          visible: { transition: { staggerChildren: 0.15 } }
        }}
        className="w-full max-w-2xl px-6 flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-16"
      >
        {/* Left Column: Location & Space */}
        <div className="flex flex-col gap-2 shrink-0 md:w-1/3">
          <motion.span 
            variants={itemVariants}
            className="font-display text-[22px] leading-[1.2] text-obsidian"
          >
            {spaceName}
          </motion.span>
          <motion.span 
            variants={itemVariants}
            className="font-body text-[11px] uppercase tracking-[0.25em] text-pewter-dark"
          >
            {location}
          </motion.span>
          <motion.div variants={itemVariants} className="w-8 h-[1px] bg-gold/40 mt-4" />
        </div>

        {/* Right Column: Story */}
        <div className="flex flex-col gap-4 md:w-2/3">
          <motion.span 
            variants={itemVariants}
            className="font-body text-[11px] uppercase tracking-[0.25em] text-obsidian/40"
          >
            {clientName}
          </motion.span>
          <motion.p 
            variants={itemVariants}
            className="font-display text-[clamp(20px,2vw,28px)] leading-[1.4] tracking-[-0.01em] italic text-obsidian"
          >
            &ldquo;{story}&rdquo;
          </motion.p>
        </div>
      </motion.div>

    </article>
  )
}
