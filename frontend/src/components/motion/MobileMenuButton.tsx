'use client'

import { useState } from 'react'
import MobileMenuOverlay from './MobileMenuOverlay'
import { motion } from 'framer-motion'

export default function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden relative z-cursor p-2 text-ivory hover:text-gold transition-colors focus:outline-none"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div className="w-6 h-5 flex flex-col justify-between items-end">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 9, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0, 0, 1] }}
            className="block h-[2px] bg-current origin-left"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="block h-[2px] w-full bg-current"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -9, width: '100%' } : { rotate: 0, y: 0, width: '75%' }}
            transition={{ duration: 0.3, ease: [0.25, 0, 0, 1] }}
            className="block h-[2px] bg-current origin-left"
          />
        </div>
      </button>

      <MobileMenuOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
