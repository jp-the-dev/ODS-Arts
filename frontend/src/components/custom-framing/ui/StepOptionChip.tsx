'use client'

import { motion } from 'framer-motion'

interface StepOptionChipProps {
  label: string
  sublabel?: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
  id?: string
}

export default function StepOptionChip({
  label,
  sublabel,
  selected,
  onClick,
  disabled,
  id,
}: StepOptionChipProps) {
  return (
    <motion.button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled && !selected ? { scale: 1.015, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`
        relative px-5 py-4 text-left transition-all duration-250 focus:outline-none group overflow-hidden
        ${selected
          ? 'text-ivory'
          : 'text-ivory/55 hover:text-ivory/90'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(201,169,110,0.14) 0%, rgba(201,169,110,0.06) 100%)'
          : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(201,169,110,0.45)' : '1px solid rgba(255,255,255,0.09)',
        boxShadow: selected ? '0 0 20px rgba(201,169,110,0.12), inset 0 1px 0 rgba(201,169,110,0.1)' : 'none',
      }}
    >
      {/* Hover shimmer (non-selected) */}
      {!selected && !disabled && (
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.025)' }}
        />
      )}

      {/* Gold left accent bar */}
      <motion.span
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: 'linear-gradient(180deg, #C9A96E, #A07840)' }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />

      <span className="font-body text-[13px] uppercase tracking-[0.14em] block font-medium">{label}</span>
      {sublabel && (
        <span className={`font-body text-[11px] block mt-0.5 transition-colors ${selected ? 'text-ivory/55' : 'text-ivory/30'}`}>
          {sublabel}
        </span>
      )}
    </motion.button>
  )
}
