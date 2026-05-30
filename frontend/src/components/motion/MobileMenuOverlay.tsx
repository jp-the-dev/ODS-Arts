'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { BRAND, NAV_LINKS } from '@/constants'

export default function MobileMenuOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
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
