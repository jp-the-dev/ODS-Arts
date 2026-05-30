'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ANIMATIONS } from '@/lib/config/animations'

const MENU_ITEMS = [
  { label: 'Collections', href: '/collections' },
  { label: 'Custom Framing', href: '/custom' },
  { label: 'Inspiration', href: '/inspiration' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const FOOTER_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'Pinterest', href: '#' },
  { label: 'WhatsApp', href: '#' },
]

export default function FloatingNavigation() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Show orb after scrolling down (e.g., 800px or 1.2 screen heights)
  useEffect(() => {
    const handleScroll = () => {
      // Show after Hero + half of Brand Statement roughly
      if (window.scrollY > window.innerHeight * 1.5) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
        // If they scroll back to top, maybe close it? Or just hide orb.
        if (isOpen && window.scrollY < window.innerHeight) {
          setIsOpen(false)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* ── The Floating Orb ── */}
      <AnimatePresence>
        {isVisible && !isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.5, ease: ANIMATIONS.ease.luxury }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-14 h-14 md:w-16 md:h-16 rounded-full bg-ivory text-obsidian flex items-center justify-center shadow-lg border border-obsidian/5 hover:scale-105 transition-transform duration-300"
            aria-label="Open Navigation"
          >
            {/* Minimalist luxury icon */}
            <span className="font-display-sc text-[10px] tracking-[0.2em] uppercase mt-[2px]">
              ODS
            </span>
            {/* The outer ring */}
            <div className="absolute inset-2 border-[0.5px] border-obsidian/20 rounded-full" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── The Luxury Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex flex-col justify-end pointer-events-none">
            
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: ANIMATIONS.ease.luxury }}
              className="absolute inset-0 bg-obsidian/40 backdrop-blur-md pointer-events-auto"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.8, ease: ANIMATIONS.ease.luxury }}
              className="relative w-full bg-ivory rounded-t-[2rem] md:rounded-t-[3rem] p-8 md:p-16 pointer-events-auto flex flex-col items-center shadow-2xl"
              style={{ maxHeight: '90vh' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 md:top-12 md:right-12 w-12 h-12 flex flex-col items-center justify-center gap-1.5 group overflow-hidden"
                aria-label="Close Navigation"
              >
                <div className="w-6 h-[1px] bg-obsidian/60 transform rotate-45 translate-y-[3.5px] transition-transform duration-500 group-hover:bg-obsidian group-hover:rotate-135" />
                <div className="w-6 h-[1px] bg-obsidian/60 transform -rotate-45 -translate-y-[3.5px] transition-transform duration-500 group-hover:bg-obsidian group-hover:-rotate-135" />
              </button>

              {/* Minimal Brand Mark */}
              <div className="mb-12 md:mb-16 flex flex-col items-center gap-4">
                <span className="font-display text-2xl text-obsidian tracking-wider">◎</span>
                <span className="font-body text-[10px] uppercase tracking-[0.4em] text-gold">Navigation</span>
              </div>

              {/* Sequential Menu Links */}
              <nav className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-md mb-16 overflow-y-auto">
                {MENU_ITEMS.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, delay: 0.2 + (i * 0.05), ease: ANIMATIONS.ease.luxury }}
                    className="group relative font-display text-[clamp(32px,4vw,48px)] leading-none text-obsidian tracking-[-0.01em]"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-[1px] bg-walnut transition-all duration-500 group-hover:w-full" />
                  </motion.a>
                ))}
              </nav>

              {/* Footer Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="w-full flex items-center justify-center gap-6 border-t border-gold/20 pt-8"
              >
                {FOOTER_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="font-body text-[10px] uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                ))}
              </motion.div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
