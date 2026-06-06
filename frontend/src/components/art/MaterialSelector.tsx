'use client'

/**
 * MaterialSelector — tabbed material picker for art configurator.
 * Shows material name, finish descriptor, and description.
 * Animated gold underline on selected tab.
 */

import { motion } from 'framer-motion'
import { PRINT_MATERIALS } from '@/lib/types/art'
import type { PrintMaterial } from '@/lib/types/art'

interface MaterialSelectorProps {
  available: PrintMaterial[]
  selected: PrintMaterial
  onChange: (material: PrintMaterial) => void
}

export default function MaterialSelector({ available, selected, onChange }: MaterialSelectorProps) {
  const materials = PRINT_MATERIALS.filter((m) => available.includes(m.id))

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs row */}
      <div className="flex flex-wrap gap-2">
        {materials.map((mat) => {
          const isActive = mat.id === selected
          return (
            <button
              key={mat.id}
              onClick={() => onChange(mat.id)}
              className="relative px-4 py-2 focus:outline-none"
              style={{
                border: `1px solid ${isActive ? '#C9A96E' : 'rgba(14,13,11,0.12)'}`,
                background: isActive ? 'rgba(201,169,110,0.06)' : 'transparent',
                transition: 'all 0.25s',
              }}
            >
              <span
                className="font-body text-[11px] uppercase tracking-[0.18em]"
                style={{ color: isActive ? '#C9A96E' : 'rgba(14,13,11,0.5)' }}
              >
                {mat.shortLabel}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mat-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: '#C9A96E' }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected material description */}
      {(() => {
        const meta = PRINT_MATERIALS.find((m) => m.id === selected)
        if (!meta) return null
        return (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-3 p-4 bg-obsidian/3 border border-obsidian/6"
          >
            {/* Swatch */}
            <div
              className="w-6 h-6 flex-shrink-0 mt-0.5 border border-obsidian/10"
              style={{ background: meta.swatchHex }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display text-[14px] text-obsidian">{meta.label}</span>
                {meta.archival && (
                  <span className="font-body text-[8px] uppercase tracking-[0.2em] text-gold bg-gold/8 px-1.5 py-0.5">
                    Archival
                  </span>
                )}
              </div>
              <p className="font-body text-[12px] text-pewter leading-relaxed">{meta.description}</p>
              <p className="font-body text-[10px] uppercase tracking-[0.15em] text-pewter/60 mt-1">
                {meta.finish}
              </p>
            </div>
          </motion.div>
        )
      })()}
    </div>
  )
}
