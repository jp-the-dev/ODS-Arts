'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CollectionsTabsProps {
  frameContent: React.ReactNode
  artContent: React.ReactNode
}

export default function CollectionsTabs({ frameContent, artContent }: CollectionsTabsProps) {
  const [active, setActive] = useState<'frames' | 'art'>('frames')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-0 mb-16 border-b border-obsidian/10">
        {(['frames', 'art'] as const).map((tab) => {
          const isActive = active === tab
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="relative px-8 py-4 focus:outline-none"
            >
              <span
                className="font-display text-[clamp(18px,1.8vw,24px)] transition-colors duration-300"
                style={{ color: isActive ? '#0E0D0B' : 'rgba(14,13,11,0.3)' }}
              >
                {tab === 'frames' ? 'Frame Collection' : 'Art Collection'}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gold"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {active === 'frames' ? frameContent : artContent}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
