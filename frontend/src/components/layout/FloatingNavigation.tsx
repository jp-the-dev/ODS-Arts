'use client'

import { useState, useEffect, useLayoutEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ANIMATIONS } from '@/lib/config/animations'
import { useAuth } from '@/lib/store/auth'

const MENU_ITEMS = [
  { label: 'Collections', href: '/collections' },
  { label: 'Art', href: '/art' },
  // Was '/custom', which has no page and 404'd.
  { label: 'Custom Framing', href: '/custom-framing' },
  { label: 'Gifting', href: '/gifting' },
  { label: 'Inspiration', href: '/inspiration' },
  { label: 'About', href: '/about' },
]

const FOOTER_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'Pinterest', href: '#' },
  { label: 'WhatsApp', href: '#' },
]

export default function FloatingNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const pathname = usePathname()

  /**
   * Signing in returns you to the page you were on, not to a generic landing.
   * Auth pages themselves are excluded — bouncing back to /login after signing
   * in would be a loop.
   */
  const signInHref = pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register')
    ? `/login?next=${encodeURIComponent(pathname)}`
    : '/login'

  // Set initial hidden state synchronously before first paint.
  // This runs client-side only ('use client'), so no SSR conflict.
  // Prevents flash of visible orb before the scroll useEffect runs.
  useLayoutEffect(() => {
    const btn = document.getElementById('floating-navigation-orb')
    if (!btn) return
    btn.style.opacity = '0'
    btn.style.pointerEvents = 'none'
    btn.style.transform = 'translate3d(0, 20px, 0) scale(0.75)'
  }, [])

  // ULTIMATE UNKILLABLE SCROLL TRACKER
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
      
      // Bypassing React refs completely. Grab the exact DOM node from the browser.
      const btn = document.getElementById('floating-navigation-orb')
      if (!btn) return // Button not in DOM yet

      if (isOpen) {
        btn.style.opacity = '0'
        btn.style.pointerEvents = 'none'
        btn.style.transform = 'translate3d(0, 20px, 0) scale(0.75)'
        return
      }

      if (currentScroll > 800) {
        btn.style.opacity = '1'
        btn.style.pointerEvents = 'auto'
        btn.style.transform = 'translate3d(0, 0px, 0) scale(1)'
      } else {
        btn.style.opacity = '0'
        btn.style.pointerEvents = 'none'
        btn.style.transform = 'translate3d(0, 20px, 0) scale(0.75)'
      }
    }

    // 1. Check immediately
    checkScroll()

    // 2. Bind all events
    window.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('pageshow', checkScroll)
    window.addEventListener('popstate', checkScroll)

    // 3. Perpetual background sync (5x a second)
    const intervalId = setInterval(checkScroll, 200)

    return () => {
      window.removeEventListener('scroll', checkScroll)
      window.removeEventListener('pageshow', checkScroll)
      window.removeEventListener('popstate', checkScroll)
      clearInterval(intervalId)
    }
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
      <button
        id="floating-navigation-orb"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-14 h-14 md:w-16 md:h-16 rounded-full bg-ivory text-obsidian flex items-center justify-center shadow-lg border border-obsidian/5 transition-all duration-500 ease-luxury focus:outline-none"
        style={{ willChange: 'transform, opacity' }}
        suppressHydrationWarning
        aria-label="Open Navigation"
      >
        <span className="font-display-sc text-[10px] tracking-[0.2em] uppercase mt-[2px] hover:scale-105 transition-transform">
          ODS
        </span>
        <div className="absolute inset-2 border-[0.5px] border-obsidian/20 rounded-full" />
      </button>

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
              className="relative w-full bg-ivory rounded-t-[2rem] md:rounded-t-[3rem] pt-10 pb-[calc(2rem+env(safe-area-inset-bottom))] px-6 md:px-16 pointer-events-auto flex flex-col items-center shadow-2xl overflow-y-auto overscroll-contain"
              style={{ maxHeight: '90vh' }}
            >
              {/* Close Button - Increased touch target */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 md:top-8 md:right-8 p-4 flex flex-col items-center justify-center gap-1.5 group overflow-hidden"
                aria-label="Close Navigation"
              >
                <div className="w-6 h-[1px] bg-obsidian/60 transform rotate-45 translate-y-[3.5px] transition-transform duration-500 group-hover:bg-obsidian group-hover:rotate-135" />
                <div className="w-6 h-[1px] bg-obsidian/60 transform -rotate-45 -translate-y-[3.5px] transition-transform duration-500 group-hover:bg-obsidian group-hover:-rotate-135" />
              </button>

              {/* Minimal Brand Mark */}
              <div className="mb-10 md:mb-16 flex flex-col items-center gap-4">
                <span className="font-display text-2xl text-obsidian tracking-wider">◎</span>
                <span className="font-body text-[10px] uppercase tracking-[0.4em] text-gold">Navigation</span>
              </div>

              {/* Sequential Menu Links */}
              <nav className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-md mb-8">
                {MENU_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, delay: 0.2 + (i * 0.05), ease: ANIMATIONS.ease.luxury }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group relative font-display text-[clamp(24px,3.2vw,38px)] leading-none text-obsidian tracking-[-0.01em] block py-2 px-6"
                    >
                      <span className="relative z-10">{item.label}</span>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-0 h-[1px] bg-walnut transition-all duration-500 group-hover:w-[calc(100%-3rem)]" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Account — the homepage has no other navigation, so without
                  this there is no way to reach an account or sign in from it. */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: ANIMATIONS.ease.luxury }}
                className="w-full max-w-md flex flex-col items-center gap-4 border-t border-gold/20 pt-8 mb-8"
              >
                {/* Nothing is rendered until the stored token has been checked,
                    so the menu never flashes "Sign in" at a signed-in customer. */}
                {isLoading ? null : isAuthenticated ? (
                  <>
                    <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
                      {user?.name ? `Signed in as ${user.name}` : 'Your account'}
                    </span>

                    <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                      <Link
                        href="/account"
                        onClick={() => setIsOpen(false)}
                        className="font-body text-[12px] uppercase tracking-[0.2em] text-obsidian border-b border-gold/50 pb-1 hover:text-walnut transition-colors"
                      >
                        Account &amp; orders
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsOpen(false)}
                        className="font-body text-[12px] uppercase tracking-[0.2em] text-obsidian border-b border-gold/50 pb-1 hover:text-walnut transition-colors"
                      >
                        Wishlist
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          void logout()
                        }}
                        className="font-body text-[12px] uppercase tracking-[0.2em] text-pewter hover:text-obsidian transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                    <Link
                      href={signInHref}
                      onClick={() => setIsOpen(false)}
                      className="font-body text-[12px] uppercase tracking-[0.2em] text-obsidian border-b border-gold/50 pb-1 hover:text-walnut transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="font-body text-[12px] uppercase tracking-[0.2em] text-pewter hover:text-obsidian transition-colors"
                    >
                      Create account
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Footer Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
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
