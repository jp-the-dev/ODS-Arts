'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ANIMATIONS } from '@/lib/config/animations'

export default function FinalCTASection() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Slow subtle parallax for the image
  const imageY = useTransform(scrollYProgress, [0, 1], [-60, 60])

  return (
    <section 
      ref={containerRef}
      className="bg-ivory w-full relative pt-32 pb-48 md:pt-48 md:pb-64 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* ── Editorial Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, ease: ANIMATIONS.ease.luxury }}
          className="mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-8 bg-gold/50" />
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
              The Journey Continues
            </span>
            <div className="h-[1px] w-8 bg-gold/50" />
          </div>
          
          <h2 className="font-display text-[clamp(48px,6vw,96px)] leading-[1.05] tracking-[-0.02em] text-obsidian mb-6">
            Preserve What <span className="italic text-walnut">Matters</span>
          </h2>
          
          <p className="font-body text-[clamp(15px,1.2vw,18px)] leading-[1.8] text-pewter-dark max-w-lg mx-auto">
            Your most meaningful moments deserve a permanent place in your home.
          </p>
        </motion.div>

        {/* ── Visual Anchor ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 1.5, ease: ANIMATIONS.ease.luxury }}
          className="w-full max-w-3xl aspect-[4/5] md:aspect-[16/9] relative mb-20 md:mb-32 overflow-hidden"
        >
          <motion.div 
            style={{ y: imageY }}
            className="absolute -inset-[10%] w-[120%] h-[120%] will-change-transform"
          >
            <Image
              src="/images/final_cta.png"
              alt="A beautiful solitary frame resting on a gallery wall bathed in sunlight"
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        {/* ── Single CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2, ease: ANIMATIONS.ease.luxury }}
        >
          <a
            href="/collections"
            className="group relative inline-flex items-center justify-center bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.25em] px-12 py-5 overflow-hidden"
          >
            <span className="relative z-10 transition-colors duration-500 group-hover:text-gold">
              Explore Collections
            </span>
            <div className="absolute inset-0 bg-walnut transform scale-x-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </a>
        </motion.div>

      </div>
    </section>
  )
}
