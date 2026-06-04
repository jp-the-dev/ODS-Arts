'use client'

import { motion } from 'framer-motion'
import StepOptionChip from '@/components/custom-framing/ui/StepOptionChip'
import type { FramingConfig } from '@/components/custom-framing/types'

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
  },
}

const PRICE_TABLE: Record<string, Record<string, number>> = {
  black:  { small: 399900, medium: 599900, large: 899900 },
  walnut: { small: 599900, medium: 899900, large: 1399900 },
  oak:    { small: 499900, medium: 799900, large: 1199900 },
  brass:  { small: 699900, medium: 999900, large: 1499900 },
}

const SIZE_BUCKET: Record<string, string> = {
  '4x6': 'small', '5x7': 'small', '8x10': 'small', '11x14': 'medium',
  '16x20': 'medium', '18x24': 'large', '24x36': 'large', 'custom': 'medium',
}

export function getEstimatedPrice(material: string, sizePreset: string): number | null {
  const bucket = SIZE_BUCKET[sizePreset] ?? 'medium'
  return PRICE_TABLE[material]?.[bucket] ?? null
}

const MATERIALS = [
  {
    id: 'walnut',
    label: 'Solid Walnut',
    description: 'Rich, warm hardwood. Hand-rubbed oil finish.',
    gradient: 'linear-gradient(135deg, #5C3D2E, #3D2B1F, #6B4C3B)',
    finishes: [
      { id: 'natural', label: 'Natural Oil', hex: '#6B4C3B' },
      { id: 'satin',   label: 'Satin',       hex: '#4A3228' },
      { id: 'dark',    label: 'Dark Roast',  hex: '#2A1A12' },
    ],
  },
  {
    id: 'oak',
    label: 'White Oak',
    description: 'Light, airy grain. Scandinavian aesthetic.',
    gradient: 'linear-gradient(135deg, #C4A882, #A68B5B, #C9AD87)',
    finishes: [
      { id: 'natural',  label: 'Natural',   hex: '#C4A882' },
      { id: 'whitewash',label: 'Whitewash', hex: '#E8DDD0' },
      { id: 'grey',     label: 'Greywash',  hex: '#9E9890' },
    ],
  },
  {
    id: 'brass',
    label: 'Brushed Brass',
    description: 'Warm gold tone. Statement piece finish.',
    gradient: 'linear-gradient(135deg, #C9A96E, #A07840, #D4B483)',
    finishes: [
      { id: 'brushed',  label: 'Brushed',  hex: '#C9A96E' },
      { id: 'polished', label: 'Polished', hex: '#D4B483' },
      { id: 'antique',  label: 'Antique',  hex: '#907040' },
    ],
  },
  {
    id: 'black',
    label: 'Matte Black',
    description: 'Modern, minimalist. Gallery-standard.',
    gradient: 'linear-gradient(135deg, #2A2A2A, #1A1A1A, #333)',
    finishes: [
      { id: 'matte', label: 'Matte', hex: '#1A1A1A' },
      { id: 'satin', label: 'Satin', hex: '#2A2A2A' },
      { id: 'gloss', label: 'Gloss', hex: '#0A0A0A' },
    ],
  },
]

const PROFILES = [
  { id: 'classic', label: 'Classic', sublabel: 'Traditional depth' },
  { id: 'slim',    label: 'Slim',    sublabel: 'Modern edge' },
  { id: 'box',     label: 'Box',     sublabel: 'Deep shadow box' },
  { id: 'ledge',   label: 'Ledge',   sublabel: 'Thin profile' },
] as const

interface Step4Props {
  config: FramingConfig
  onChange: (updates: Partial<FramingConfig['frame']>) => void
  onPriceChange: (pricePaise: number | null) => void
  onNext: () => void
  onBack: () => void
  sizePreset: string
}

export default function Step4Frame({ config, onChange, onPriceChange, onNext, onBack, sizePreset }: Step4Props) {
  const selectedMaterial = MATERIALS.find((m) => m.id === config.frame.material)
  const isValid = !!config.frame.material && !!config.frame.profile

  function handleMaterialSelect(id: string) {
    onChange({ material: id as FramingConfig['frame']['material'], finish: null })
    onPriceChange(getEstimatedPrice(id, sizePreset))
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-10"
    >
      <motion.div variants={stagger.item}>
        <p className="font-body text-[11px] uppercase tracking-[0.35em] mb-3" style={{ color: '#C9A96E' }}>
          Step 04 of 05
        </p>
        <h2 className="font-display leading-[1.05] tracking-tight text-ivory" style={{ fontSize: 'clamp(38px, 4.5vw, 58px)' }}>
          Your Frame
        </h2>
        <p className="font-body leading-relaxed mt-4" style={{ fontSize: '15px', color: 'rgba(245,240,232,0.65)' }}>
          Choose the material, finish, and profile that will surround your artwork.
        </p>
      </motion.div>

      {/* Material cards */}
      <motion.div variants={stagger.item} className="flex flex-col gap-4">
        <p className="font-body text-[11px] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,232,0.4)' }}>Material</p>
        <div className="grid grid-cols-2 gap-3">
          {MATERIALS.map((mat) => {
            const selected = config.frame.material === mat.id
            return (
              <motion.button
                key={mat.id}
                id={`frame-material-${mat.id}`}
                type="button"
                onClick={() => handleMaterialSelect(mat.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="text-left focus:outline-none overflow-hidden"
                style={{
                  padding: '16px',
                  background: selected
                    ? 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.05))'
                    : 'rgba(255,255,255,0.03)',
                  border: selected ? '1px solid rgba(201,169,110,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: selected ? '0 0 24px rgba(201,169,110,0.1)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Gradient swatch strip */}
                <div className="w-full h-7 mb-4 rounded-[1px]" style={{ background: mat.gradient }} />
                <p className="font-body uppercase tracking-[0.14em] mb-1.5" style={{ fontSize: '12px', color: selected ? '#C9A96E' : 'rgba(245,240,232,0.65)' }}>
                  {mat.label}
                </p>
                <p className="font-body leading-snug" style={{ fontSize: '11px', color: 'rgba(245,240,232,0.35)' }}>
                  {mat.description}
                </p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Finish + Profile */}
      {selectedMaterial && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col gap-8"
        >
          {/* Finish swatches */}
          <div className="flex flex-col gap-4">
            <p className="font-body text-[11px] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,232,0.4)' }}>
              Finish —{' '}
              <span style={{ color: 'rgba(245,240,232,0.75)' }}>
                {selectedMaterial.finishes.find(f => f.id === config.frame.finish)?.label ?? 'Select'}
              </span>
            </p>
            <div className="flex gap-4">
              {selectedMaterial.finishes.map((finish) => {
                const sel = config.frame.finish === finish.id
                return (
                  <button
                    key={finish.id}
                    id={`finish-${finish.id}`}
                    type="button"
                    onClick={() => onChange({ finish: finish.id })}
                    title={finish.label}
                    aria-label={finish.label}
                    className="relative w-10 h-10 rounded-full focus:outline-none transition-transform duration-200"
                    style={{
                      backgroundColor: finish.hex,
                      transform: sel ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: sel ? `0 0 0 2.5px #C9A96E, 0 0 12px rgba(201,169,110,0.3)` : `0 0 0 1px rgba(255,255,255,0.1)`,
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Profile */}
          <div className="flex flex-col gap-4">
            <p className="font-body text-[11px] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,232,0.4)' }}>Profile</p>
            <div className="grid grid-cols-2 gap-2.5">
              {PROFILES.map((p) => (
                <StepOptionChip
                  key={p.id}
                  id={`profile-${p.id}`}
                  label={p.label}
                  sublabel={p.sublabel}
                  selected={config.frame.profile === p.id}
                  onClick={() => onChange({ profile: p.id })}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Nav */}
      <motion.div variants={stagger.item} className="flex gap-3">
        <button type="button" onClick={onBack}
          className="font-body uppercase tracking-[0.2em] transition-all focus:outline-none"
          style={{ padding: '16px 24px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,240,232,0.5)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(245,240,232,0.8)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(245,240,232,0.5)' }}
        >
          Back
        </button>
        <motion.button type="button" onClick={onNext} disabled={!isValid}
          whileHover={isValid ? { scale: 1.01 } : {}}
          whileTap={isValid ? { scale: 0.99 } : {}}
          className="flex-1 font-body uppercase tracking-[0.22em] flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none"
          style={{
            padding: '18px',
            fontSize: '12px',
            background: isValid ? 'linear-gradient(135deg, #C9A96E, #A07840)' : 'rgba(255,255,255,0.05)',
            color: isValid ? '#12100E' : 'rgba(245,240,232,0.25)',
            cursor: isValid ? 'pointer' : 'not-allowed',
            boxShadow: isValid ? '0 4px 24px rgba(201,169,110,0.25)' : 'none',
          }}
        >
          Review & Request
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
