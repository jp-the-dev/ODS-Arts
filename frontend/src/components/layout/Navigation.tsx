'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { BRAND, NAV_LINKS } from '@/constants'
import MobileMenuButton from '@/components/motion/MobileMenuButton'
import Container from '@/components/layout/Container'

export default function Navigation() {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50)
  })

  const navLinks = NAV_LINKS.filter(link =>
    ['Collections', 'Custom Framing', 'Inspiration', 'About'].some(
      req => link.label.includes(req) || req.includes(link.label)
    )
  )

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-sticky transition-all duration-500 ease-luxury ${
        isScrolled
          ? 'bg-ivory/90 backdrop-blur-nav border-b border-obsidian/8 py-3 shadow-sm'
          : 'bg-transparent border-b border-transparent py-5 md:py-6'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Container size="full">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex-1 lg:flex-none">
            <Link
              href="/"
              className="font-display-heading text-[22px] md:text-h3 text-obsidian tracking-wide hover:text-walnut transition-colors duration-300"
            >
              {BRAND.name}
            </Link>
          </div>

          {/* Desktop Nav — centered */}
          <nav className="hidden lg:flex flex-1 justify-center items-center space-x-10" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-label uppercase tracking-label text-obsidian/65 hover:text-obsidian transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile */}
          <div className="flex flex-1 justify-end items-center gap-4">
            <div className="hidden lg:block">
              <a
                href="/collections"
                className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border border-obsidian/25 hover:border-obsidian px-5 py-3 transition-all duration-300 hover:bg-obsidian hover:text-ivory"
              >
                Explore Collection
              </a>
            </div>
            <MobileMenuButton />
          </div>

        </div>
      </Container>
    </motion.header>
  )
}
