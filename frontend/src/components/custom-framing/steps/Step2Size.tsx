'use client'

import { useState } from 'react'
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

const PRESETS = [
  { id: '4x6',   label: '4 × 6',   sublabel: '10 × 15 cm' },
  { id: '5x7',   label: '5 × 7',   sublabel: '13 × 18 cm' },
  { id: '8x10',  label: '8 × 10',  sublabel: '20 × 25 cm' },
  { id: '11x14', label: '11 × 14', sublabel: '28 × 36 cm' },
  { id: '16x20', label: '16 × 20', sublabel: '41 × 51 cm' },
  { id: '18x24', label: '18 × 24', sublabel: '46 × 61 cm' },
  { id: '24x36', label: '24 × 36', sublabel: '61 × 91 cm' },
]

interface Step2Props {
  config: FramingConfig
  onChange: (updates: Partial<FramingConfig['size']>) => void
  onNext: () => void
  onBack: () => void
}

const inputStyle = {
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#F5F0E8',
  padding: '14px 16px',
  fontSize: '15px',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}

export default function Step2Size({ config, onChange, onNext, onBack }: Step2Props) {
  const [showCustom, setShowCustom] = useState(config.size.preset === 'custom')

  const isValid = config.size.preset
    ? config.size.preset !== 'custom' || (!!config.size.widthCm && !!config.size.heightCm)
    : false

  function selectPreset(id: string) {
    if (id === 'custom') {
      setShowCustom(true)
      onChange({ preset: 'custom', widthCm: null, heightCm: null })
    } else {
      setShowCustom(false)
      const [w, h] = id.split('x').map(Number)
      onChange({ preset: id, widthCm: w * 2.54, heightCm: h * 2.54 })
    }
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
          Step 02 of 05
        </p>
        <h2 className="font-display leading-[1.05] tracking-tight text-ivory" style={{ fontSize: 'clamp(38px, 4.5vw, 58px)' }}>
          Choose Your Size
        </h2>
        <p className="font-body leading-relaxed mt-4" style={{ fontSize: '15px', color: 'rgba(245,240,232,0.65)' }}>
          Select a standard size or enter custom dimensions. The frame preview updates in real time.
        </p>
      </motion.div>

      <motion.div variants={stagger.item} className="flex flex-col gap-4">
        <p className="font-body text-[11px] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,232,0.4)' }}>
          Standard sizes — inches
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((p) => (
            <StepOptionChip
              key={p.id}
              id={`size-${p.id}`}
              label={p.label}
              sublabel={p.sublabel}
              selected={config.size.preset === p.id}
              onClick={() => selectPreset(p.id)}
            />
          ))}
          <StepOptionChip
            id="size-custom"
            label="Custom"
            sublabel="Enter dimensions"
            selected={showCustom}
            onClick={() => selectPreset('custom')}
          />
        </div>
      </motion.div>

      {showCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-end gap-4"
        >
          <div className="flex-1">
            <label htmlFor="custom-width" className="font-body text-[11px] uppercase tracking-[0.2em] block mb-2" style={{ color: 'rgba(245,240,232,0.45)' }}>Width</label>
            <input
              id="custom-width"
              type="number"
              min={5}
              max={200}
              placeholder="30"
              value={config.size.widthCm ?? ''}
              onChange={(e) => onChange({ widthCm: parseFloat(e.target.value) || null })}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.6)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <span className="font-display text-2xl mb-3" style={{ color: 'rgba(245,240,232,0.3)' }}>×</span>
          <div className="flex-1">
            <label htmlFor="custom-height" className="font-body text-[11px] uppercase tracking-[0.2em] block mb-2" style={{ color: 'rgba(245,240,232,0.45)' }}>Height</label>
            <input
              id="custom-height"
              type="number"
              min={5}
              max={200}
              placeholder="40"
              value={config.size.heightCm ?? ''}
              onChange={(e) => onChange({ heightCm: parseFloat(e.target.value) || null })}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.6)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(245,240,232,0.45)' }}>Unit</p>
            <div className="flex overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              {(['cm', 'in'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onChange({ unit })}
                  className="font-body uppercase tracking-[0.1em] transition-all duration-200 focus:outline-none"
                  style={{
                    padding: '14px 14px',
                    fontSize: '12px',
                    background: config.size.unit === unit ? 'rgba(201,169,110,0.2)' : 'transparent',
                    color: config.size.unit === unit ? '#C9A96E' : 'rgba(245,240,232,0.4)',
                  }}
                >
                  {unit}
                </button>
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
          Continue to Mat
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
