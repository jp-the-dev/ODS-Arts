'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Container from '@/components/layout/Container'
import EyebrowLabel from '@/components/ui/EyebrowLabel'

export default function AboutHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center bg-ivory pt-32 pb-16 overflow-hidden"
    >
      {/* Decorative background noise/gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,169,110,0.05),transparent_50%)] pointer-events-none" />

      <Container size="text" className="relative z-10 w-full text-center">
        <motion.div 
          style={{ y, opacity }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          {/* Eyebrow */}
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <EyebrowLabel color="obsidian">Since 2024</EyebrowLabel>
          </div>

          {/* Main Title */}
          <h1 
            className="font-display text-[clamp(48px,7vw,110px)] leading-[0.95] tracking-tightest text-obsidian animate-fade-up"
            style={{ animationDelay: '300ms' }}
          >
            The Pursuit of<br />
            <span className="italic font-light" style={{ color: '#8B8680' }}>Perfection</span>
          </h1>

          {/* Gold separator line */}
          <div 
            className="w-12 h-[1px] bg-gold animate-fade-up"
            style={{ animationDelay: '500ms' }}
          />

          {/* Subtitle / Intro paragraph */}
          <p 
            className="font-body text-[clamp(16px,1.2vw,20px)] leading-relaxed text-pewter-dark max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: '700ms' }}
          >
            We believe that the frame shouldn&apos;t just hold the art; it should elevate it. 
            Step inside our studio to see how centuries-old woodworking techniques meet 
            modern archival preservation.
          </p>

        </motion.div>
      </Container>
    </section>
  )
}
