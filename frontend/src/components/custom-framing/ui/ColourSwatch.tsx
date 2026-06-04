'use client'

import { motion } from 'framer-motion'

interface ColourSwatchProps {
  colour: string        // CSS hex or color value
  label: string
  selected: boolean
  onClick: () => void
  id?: string
}

export default function ColourSwatch({ colour, label, selected, onClick, id }: ColourSwatchProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      title={label}
      aria-label={`${label} mat colour`}
      className="relative w-9 h-9 rounded-full focus:outline-none group flex-shrink-0"
    >
      {/* Swatch fill */}
      <span
        className="absolute inset-0 rounded-full border border-white/10"
        style={{ backgroundColor: colour }}
      />

      {/* Gold ring on selected — animates in */}
      {selected && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.25, 0, 0, 1] }}
          className="absolute -inset-[3px] rounded-full border-2 border-gold"
        />
      )}

      {/* Hover ring on unselected */}
      {!selected && (
        <span className="absolute -inset-[3px] rounded-full border border-ivory/0 group-hover:border-ivory/30 transition-colors duration-200" />
      )}
    </button>
  )
}
