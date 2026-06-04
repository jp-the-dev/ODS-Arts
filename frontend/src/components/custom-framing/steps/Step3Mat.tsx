'use client'

import { motion } from 'framer-motion'
import StepOptionChip from '@/components/custom-framing/ui/StepOptionChip'
import ColourSwatch from '@/components/custom-framing/ui/ColourSwatch'
import type { FramingConfig } from '@/components/custom-framing/types'

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
  },
}

const MAT_STYLES = [
  { id: 'none',   label: 'No Mat',     sublabel: 'Frame only' },
  { id: 'single', label: 'Single Mat', sublabel: 'Classic border' },
  { id: 'double', label: 'Double Mat', sublabel: 'Layered depth' },
  { id: 'museum', label: 'Museum Mat', sublabel: '8-ply archival' },
] as const

const MAT_COLOURS = [
  { id: 'white',     label: 'White',     hex: '#FFFFFF' },
  { id: 'off-white', label: 'Off-White', hex: '#F8F5F0' },
  { id: 'ivory',     label: 'Ivory',     hex: '#F5F0E8' },
  { id: 'warm-grey', label: 'Warm Grey', hex: '#9E9890' },
  { id: 'black',     label: 'Black',     hex: '#1A1A18' },
  { id: 'navy',      label: 'Navy',      hex: '#1B2A4A' },
  { id: 'forest',    label: 'Forest',    hex: '#2D4A35' },
  { id: 'burgundy',  label: 'Burgundy',  hex: '#5C1F2E' },
] as const

const MAT_WIDTHS = [
  { id: 'narrow',   label: 'Narrow',   sublabel: '1.5 inch' },
  { id: 'standard', label: 'Standard', sublabel: '2 inch' },
  { id: 'wide',     label: 'Wide',     sublabel: '3 inch' },
] as const

interface Step3Props {
  config: FramingConfig
  onChange: (updates: Partial<FramingConfig['mat']>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Mat({ config, onChange, onNext, onBack }: Step3Props) {
  const noMat = config.mat.style === 'none'
  const isValid = !!config.mat.style

  const selectedColour = MAT_COLOURS.find(c => c.id === config.mat.colour)

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-10"
    >
      <motion.div variants={stagger.item}>
        <p className="font-body text-[11px] uppercase tracking-[0.35em] mb-3" style={{ color: '#C9A96E' }}>
          Step 03 of 05
        </p>
        <h2 className="font-display leading-[1.05] tracking-tight text-ivory" style={{ fontSize: 'clamp(38px, 4.5vw, 58px)' }}>
          Your Mat
        </h2>
        <p className="font-body leading-relaxed mt-4" style={{ fontSize: '15px', color: 'rgba(245,240,232,0.65)' }}>
          A mat creates breathing room between your artwork and frame. It elevates the whole composition.
        </p>
      </motion.div>

      {/* Mat style chips */}
      <motion.div variants={stagger.item} className="flex flex-col gap-4">
        <p className="font-body text-[11px] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,232,0.4)' }}>Style</p>
        <div className="grid grid-cols-2 gap-2.5">
          {MAT_STYLES.map((s) => (
            <StepOptionChip
              key={s.id}
              id={`mat-style-${s.id}`}
              label={s.label}
              sublabel={s.sublabel}
              selected={config.mat.style === s.id}
              onClick={() => onChange({ style: s.id as FramingConfig['mat']['style'] })}
            />
          ))}
        </div>
      </motion.div>

      {/* Colour + width — animate in when mat is chosen */}
      {!noMat && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col gap-8"
        >
          {/* Colour */}
          <div className="flex flex-col gap-4">
            <p className="font-body text-[11px] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,232,0.4)' }}>
              Colour —{' '}
              <span style={{ color: 'rgba(245,240,232,0.75)' }}>{selectedColour?.label ?? 'Select a colour'}</span>
            </p>
            <div className="flex flex-wrap gap-4">
              {MAT_COLOURS.map((c) => (
                <ColourSwatch
                  key={c.id}
                  id={`mat-colour-${c.id}`}
                  colour={c.hex}
                  label={c.label}
                  selected={config.mat.colour === c.id}
                  onClick={() => onChange({ colour: c.id, colourHex: c.hex, colourLabel: c.label })}
                />
              ))}
            </div>
          </div>

          {/* Width */}
          <div className="flex flex-col gap-4">
            <p className="font-body text-[11px] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,232,0.4)' }}>Width</p>
            <div className="grid grid-cols-3 gap-2.5">
              {MAT_WIDTHS.map((w) => (
                <StepOptionChip
                  key={w.id}
                  id={`mat-width-${w.id}`}
                  label={w.label}
                  sublabel={w.sublabel}
                  selected={config.mat.width === w.id}
                  onClick={() => onChange({ width: w.id as FramingConfig['mat']['width'] })}
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
          Continue to Frame
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
