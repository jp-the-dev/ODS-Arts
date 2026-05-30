'use client'

import { motion } from 'framer-motion'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Container from '@/components/layout/Container'
import { ANIMATIONS } from '@/lib/config/animations'

interface HeroContentProps {
  y: any
}

export default function HeroContent({ y }: HeroContentProps) {
  return (
    <motion.div
      style={{ y }}
      className="relative z-10 w-full flex items-center justify-center text-center mt-16 md:mt-20"
    >
      <Container size="text">
        <div className="flex flex-col items-center space-y-6 md:space-y-7">
          
          {/* Eyebrow with side rules */}
          <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="h-[1px] w-8 bg-gold/60" />
            <EyebrowLabel color="gold">Crafted For Timeless Memories</EyebrowLabel>
            <div className="h-[1px] w-8 bg-gold/60" />
          </div>

          {/* Heading — ivory on warm-dark centre scrim */}
          <h1
            className="font-display text-[clamp(38px,5.5vw,82px)] leading-[1.04] tracking-[-0.025em] text-ivory animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            Where Memories<br />
            <span className="italic" style={{ color: '#E8D5B0' }}>Become Art</span>
          </h1>

          {/* Thin gold rule */}
          <div
            className="w-8 h-[1.5px] bg-gold/70 animate-fade-up"
            style={{ animationDelay: '600ms' }}
          />

          {/* Description — soft ivory for elegance over dark scrim */}
          <p
            className="font-body text-[clamp(14px,1.15vw,17px)] leading-[1.8] max-w-sm md:max-w-md mx-auto animate-fade-up"
            style={{ color: 'rgba(245,240,232,0.72)', animationDelay: '800ms' }}
          >
            Premium handcrafted frames designed to preserve life&apos;s most meaningful moments.
          </p>

          {/* Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-3 animate-fade-up"
            style={{ animationDelay: '1000ms' }}
          >
            <a
              href="/collections"
              className="inline-flex items-center justify-center gap-2.5 bg-ivory text-obsidian font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 hover:bg-gold hover:text-obsidian transition-colors duration-500"
            >
              Explore Collection
            </a>
            <a
              href="/about"
              className="inline-flex items-center font-body text-[11px] uppercase tracking-[0.22em] transition-all duration-400 pb-[2px] border-b"
              style={{ color: 'rgba(245,240,232,0.6)', borderColor: 'rgba(245,240,232,0.28)' }}
            >
              Our Story
            </a>
          </div>

        </div>
      </Container>
    </motion.div>
  )
}
