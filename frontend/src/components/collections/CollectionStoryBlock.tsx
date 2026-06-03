'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ANIMATIONS } from '@/lib/config/animations'

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

const blockVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: ANIMATIONS.ease.luxury },
  },
}

const imageVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: ANIMATIONS.ease.luxury },
  },
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
  
  const containerRef = useRef<HTMLElement>(null)
  const isImageRight = imagePosition === 'right'

  // Subtle parallax effect on the image container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  
  // The image drifts slightly downwards as you scroll past it
  const imageY = useTransform(scrollYProgress, [0, 1], [-30, 30])

  return (
    <motion.article
      ref={containerRef}
      variants={blockVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      className={`flex flex-col ${isImageRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24 lg:gap-32 w-full py-16 md:py-32`}
    >
      
      {/* ── Image Column ── */}
      <motion.div 
        variants={imageVariants}
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
          {/* Subtle inner shadow for depth */}
          <div className="absolute inset-0 shadow-inner pointer-events-none" />
        </motion.div>
      </motion.div>

      {/* ── Content Column ── */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col items-center text-center md:items-start md:text-left">
        
        <motion.span 
          variants={itemVariants}
          className="font-display text-[80px] leading-[0.8] text-gold/20 mb-12 select-none"
        >
          {number}
        </motion.span>
        
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
          {!isImageRight && <div className="h-[1px] w-8 bg-gold/50 hidden md:block" />}
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
            {eyebrow}
          </span>
          <div className="h-[1px] w-8 bg-gold/50" />
        </motion.div>

        <motion.h3 
          variants={itemVariants}
          className="font-display text-[clamp(40px,4vw,64px)] leading-[1.05] tracking-[-0.02em] text-obsidian mb-8"
        >
          {title.split(' ').map((word, i, arr) => {
            // Italicize the last word for editorial flair
            if (i === arr.length - 1) {
              return <span key={i} className="italic text-walnut">{word}</span>
            }
            return <span key={i}>{word} </span>
          })}
        </motion.h3>

        <motion.div variants={itemVariants} className="w-8 h-[1px] bg-gold/50 mb-8 md:hidden" />

        <motion.p 
          variants={itemVariants}
          className="font-body text-[clamp(15px,1.2vw,17px)] leading-[1.8] text-pewter-dark max-w-sm mb-12"
        >
          {description}
        </motion.p>

        <motion.div variants={itemVariants} className="mb-14 w-full">
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
        </motion.div>

        <motion.a
          variants={itemVariants}
          href={linkHref}
          className="group inline-flex items-center gap-3 font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border-b border-obsidian/20 hover:border-obsidian pb-1 transition-all duration-400"
        >
          Explore Series
          <span className="transform transition-transform duration-400 group-hover:translate-x-2">
            →
          </span>
        </motion.a>

      </div>
    </motion.article>
  )
}
