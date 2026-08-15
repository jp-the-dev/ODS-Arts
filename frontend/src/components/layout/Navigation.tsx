'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { BRAND, NAV_LINKS } from '@/constants'
import MobileMenuButton from '@/components/motion/MobileMenuButton'
import Container from '@/components/layout/Container'
import SearchDrawer from '@/components/layout/SearchDrawer'
import { useCart } from '@/lib/store/cart'

export default function Navigation() {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems, openDrawer } = useCart()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50)
  })

  // Hide the top navigation entirely on the homepage since we use the FloatingNavigation orb there
  // This MUST be after all hooks to prevent React from crashing
  if (pathname === '/') {
    return null
  }

  const navLinks = NAV_LINKS.filter(link =>
    ['Collections', 'Art', 'Custom Framing', 'Inspiration', 'About'].some(
      req => link.label.includes(req) || req.includes(link.label)
    )
  )

  return (
    <>
    <motion.header
      className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-500 ease-luxury ${
        isScrolled
          ? 'bg-ivory/90 backdrop-blur-nav border-b border-obsidian/8 py-3 shadow-sm'
          : 'bg-transparent border-b border-transparent py-5 md:py-6'
      }`}
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

          {/* CTA + Search + Mobile */}
          <div className="flex flex-1 justify-end items-center gap-3">
            {/* Search icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-obsidian/60 hover:text-obsidian transition-colors focus:outline-none"
              aria-label="Search frames"
            >
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M11 11L15.5 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="w-9 h-9 flex items-center justify-center text-obsidian/60 hover:text-obsidian transition-colors focus:outline-none"
              aria-label="Your account"
            >
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="8.5" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2.5 15c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </Link>

            {/* Cart icon with live count badge */}
            <button
              onClick={openDrawer}
              className="relative w-9 h-9 flex items-center justify-center text-obsidian/60 hover:text-obsidian transition-colors focus:outline-none"
              aria-label={`Open cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
            >
              <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
                <path d="M1 1H3.5L5.5 11H13.5L15.5 4H4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7" cy="14" r="1" fill="currentColor"/>
                <circle cx="12" cy="14" r="1" fill="currentColor"/>
              </svg>
              {totalItems > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center font-body text-[9px] text-ivory leading-none px-0.5"
                  style={{ background: '#C9A96E' }}
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
            <div className="hidden lg:block">
              <Link
                href="/collections"
                className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border border-obsidian/25 hover:border-obsidian px-5 py-3 transition-all duration-300 hover:bg-obsidian hover:text-ivory"
              >
                Explore Collection
              </Link>
            </div>
            <MobileMenuButton />
          </div>

        </div>
      </Container>
    </motion.header>
    <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
  </>
  )
}
