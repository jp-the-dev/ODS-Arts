'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import HeroContent from './HeroContent'
import HeroScrollIndicator from './HeroScrollIndicator'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 18,
    restDelta: 0.001,
  })

  const imageScale     = useTransform(springProgress, [0, 1],      [1, 1.08])
  const bloomOpacity   = useTransform(springProgress, [0.3, 0.9],  [0, 1])
  // We remove contentOpacity to prevent the text from getting stuck at opacity: 0 on remount
  const contentY       = useTransform(springProgress, [0, 0.4],    [0, -40])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100svh] min-h-[600px] overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#F5F0E8' }}
      aria-label="ODSArts — Where Memories Become Art"
    >
      {/* ── Background Image + centre scrim ── */}
      {/* Outer wrapper handles scroll-driven scale. 
          We intentionally DO NOT animate opacity out to prevent remount bugs on back-navigation.
          Instead, the ivory bloom overlay naturally covers the image. */}
      <motion.div
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{ scale: imageScale }}
      >
        {/* Inner wrapper uses pure CSS for entry fade-in to prevent React/Framer remount bugs */}
        <div className="relative w-full h-full animate-fade-in-slow">
          <Image
            src="/images/hero/hero-main.jpg"
            alt="Premium handcrafted frames in a luxury interior"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Scrim lives inside the animated wrapper — no flash on nav-back */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(28,20,14,0.42) 0%, transparent 100%)',
            }}
          />
        </div>
      </motion.div>

      {/* ── Scroll-driven ivory bloom — only activates on scroll, seamless into section 2 ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: bloomOpacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: '#F5F0E8',
          }}
        />
      </motion.div>

      {/* ── Hero Content — centered ── */}
      <HeroContent y={contentY} />

      {/* ── Scroll Indicator ── */}
      <HeroScrollIndicator />
    </section>
  )
}
