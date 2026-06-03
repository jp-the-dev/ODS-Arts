'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function FinalCTASection() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [-60, 60])

  // Direct DOM reveal refs — synchronous, no React state timing issues
  const titleRef = useScrollReveal({ threshold: 0.2 })
  const imageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, duration: 1500, delay: 100 })
  const ctaRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3, delay: 200 })

  return (
    <section 
      ref={containerRef}
      className="bg-ivory w-full relative pt-32 pb-48 md:pt-48 md:pb-64 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* ── Editorial Title ── */}
        <div ref={titleRef} className="mb-16 md:mb-24">
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
        </div>

        {/* ── Visual Anchor ── */}
        <div
          ref={imageRef}
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
        </div>

        {/* ── Single CTA ── */}
        <div ref={ctaRef}>
          <Link
            href="/collections"
            className="group inline-flex items-center gap-4 bg-obsidian text-ivory px-8 py-5 font-body text-[11px] uppercase tracking-[0.2em] hover:bg-walnut transition-colors duration-500"
          >
            <span>Explore Collections</span>
            <div className="w-8 h-[1px] bg-gold/50 group-hover:w-12 transition-all duration-500" />
          </Link>
        </div>

      </div>
    </section>
  )
}
