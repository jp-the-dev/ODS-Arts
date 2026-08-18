'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BRAND, NAV_LINKS } from '@/constants'
import { useAuth } from '@/lib/store/auth'

export default function MobileMenuOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const pathname = usePathname()

  const signInHref = pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register')
    ? `/login?next=${encodeURIComponent(pathname)}`
    : '/login'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0, 0, 1] }}
          className="fixed inset-0 z-overlay bg-obsidian flex flex-col px-5 pt-24 pb-8"
        >
          <div className="flex-1 flex flex-col justify-center space-y-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="font-display text-h1 text-ivory italic hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Account. Absent entirely before, so on a phone there was no way
              to sign in, reach orders, or open the wishlist. */}
          <div className="border-t border-ivory/15 pt-6 pb-8">
            {isLoading ? null : isAuthenticated ? (
              <div className="flex flex-col gap-4">
                {user?.name && (
                  <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
                    Signed in as {user.name}
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link href="/account" onClick={onClose} className="font-body text-[13px] uppercase tracking-[0.18em] text-ivory hover:text-gold transition-colors">
                    Account &amp; orders
                  </Link>
                  <Link href="/wishlist" onClick={onClose} className="font-body text-[13px] uppercase tracking-[0.18em] text-ivory hover:text-gold transition-colors">
                    Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      void logout()
                    }}
                    className="font-body text-[13px] uppercase tracking-[0.18em] text-pewter hover:text-ivory transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href={signInHref} onClick={onClose} className="font-body text-[13px] uppercase tracking-[0.18em] text-ivory hover:text-gold transition-colors">
                  Sign in
                </Link>
                <Link href="/register" onClick={onClose} className="font-body text-[13px] uppercase tracking-[0.18em] text-pewter hover:text-ivory transition-colors">
                  Create account
                </Link>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <Link
              href="/collections"
              onClick={onClose}
              className="block w-full py-4 bg-gold text-obsidian text-center font-body text-label uppercase tracking-label font-medium mb-12 hover:bg-gold-light transition-colors"
            >
              Shop Now
            </Link>

            <div className="flex justify-between font-body text-label-xs text-pewter uppercase tracking-label">
              <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                Instagram
              </a>
              <a href={BRAND.pinterest} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                Pinterest
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
