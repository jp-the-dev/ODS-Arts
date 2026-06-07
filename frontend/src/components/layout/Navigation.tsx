'use client'

import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { BRAND, NAV_LINKS } from '@/constants'
import MobileMenuButton from '@/components/motion/MobileMenuButton'
import Container from '@/components/layout/Container'
import SearchDrawer from '@/components/layout/SearchDrawer'
import { useCart } from '@/lib/store/cart'
import { useAuth } from '@/lib/store/auth'

export default function Navigation() {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems, openDrawer } = useCart()
  const { user } = useAuth()

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

  // Determine if the current page has a dark background at the top and we haven't scrolled yet
  const isDarkNav = pathname === '/account' && !isScrolled

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
              className={`font-display-heading text-[22px] md:text-h3 tracking-wide transition-colors duration-300 ${
                isDarkNav ? 'text-ivory hover:text-gold' : 'text-obsidian hover:text-walnut'
              }`}
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
                className={`font-body text-label uppercase tracking-label transition-colors duration-300 ${
                  isDarkNav ? 'text-ivory/70 hover:text-ivory' : 'text-obsidian/65 hover:text-obsidian'
                }`}
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
              className={`w-9 h-9 flex items-center justify-center transition-colors focus:outline-none ${
                isDarkNav ? 'text-ivory/80 hover:text-ivory' : 'text-obsidian/60 hover:text-obsidian'
              }`}
              aria-label="Search frames"
            >
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M11 11L15.5 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Cart icon with live count badge */}
            <button
              onClick={openDrawer}
              className={`relative w-9 h-9 flex items-center justify-center transition-colors focus:outline-none ${
                isDarkNav ? 'text-ivory/80 hover:text-ivory' : 'text-obsidian/60 hover:text-obsidian'
              }`}
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

            {/* Auth link */}
            <div className="hidden lg:flex items-center justify-center">
              {user ? (
                <Link
                  href="/account"
                  className={`font-body text-label uppercase tracking-label transition-colors flex items-center justify-center h-9 w-9 ${
                    isDarkNav ? 'text-ivory/80 hover:text-ivory' : 'text-obsidian/65 hover:text-obsidian'
                  }`}
                  aria-label="My account"
                >
                  {user.auth_provider === 'google' && user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt=""
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className={`font-body text-label uppercase tracking-label transition-colors ${
                    isDarkNav ? 'text-ivory/80 hover:text-ivory' : 'text-obsidian/65 hover:text-obsidian'
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>

            <div className="hidden lg:block ml-2">
              <Link
                href="/collections"
                className={`font-body text-[11px] uppercase tracking-[0.22em] px-5 py-3 transition-all duration-300 ${
                  isDarkNav
                    ? 'text-ivory border border-ivory/30 hover:border-ivory hover:bg-ivory hover:text-obsidian'
                    : 'text-obsidian border border-obsidian/25 hover:border-obsidian hover:bg-obsidian hover:text-ivory'
                }`}
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
