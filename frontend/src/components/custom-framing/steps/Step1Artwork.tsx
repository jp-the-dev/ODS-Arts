'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { FramingConfig } from '@/components/custom-framing/types'

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
  },
}

interface Step1Props {
  config: FramingConfig
  onChange: (updates: Partial<FramingConfig['artwork']>) => void
  onNext: () => void
}

export default function Step1Artwork({ config, onChange, onNext }: Step1Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange({ file, previewUrl: e.target?.result as string, provided: true })
    }
    reader.readAsDataURL(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-10"
    >
      {/* Heading */}
      <motion.div variants={stagger.item}>
        <p className="font-body text-[11px] uppercase tracking-[0.35em] mb-3" style={{ color: '#C9A96E' }}>
          Step 01 of 05
        </p>
        <h2 className="font-display leading-[1.05] tracking-tight text-ivory" style={{ fontSize: 'clamp(38px, 4.5vw, 58px)' }}>
          Your Artwork
        </h2>
        <p className="font-body leading-relaxed mt-4" style={{ fontSize: '15px', color: 'rgba(245,240,232,0.65)' }}>
          Upload the photo you&apos;d like framed. We&apos;ll use it to create an accurate live preview.
        </p>
      </motion.div>

      {/* Upload zone */}
      <motion.div variants={stagger.item}>
        {config.artwork.previewUrl ? (
          <div className="flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: '4/3', border: '1px solid rgba(201,169,110,0.3)', boxShadow: '0 0 30px rgba(201,169,110,0.08)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.artwork.previewUrl}
                alt="Your artwork"
                className="w-full h-full object-contain"
                style={{ background: 'rgba(0,0,0,0.4)' }}
              />
            </motion.div>
            <div className="flex items-center justify-between">
              <p className="font-body text-[12px]" style={{ color: 'rgba(245,240,232,0.45)' }}>
                {config.artwork.file?.name}
              </p>
              <button
                type="button"
                onClick={() => onChange({ file: null, previewUrl: null, provided: false })}
                className="font-body text-[11px] uppercase tracking-[0.15em] transition-colors focus:outline-none"
                style={{ color: 'rgba(245,240,232,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.75)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.4)')}
              >
                Remove ×
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            whileHover={{ borderColor: 'rgba(201,169,110,0.5)' }}
            className="group relative cursor-pointer transition-all duration-400"
            style={{
              padding: '3.5rem 2.5rem',
              border: '1.5px dashed rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.018)',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleInputChange}
              aria-label="Upload artwork"
            />
            <div className="flex flex-col items-center gap-5 text-center">
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ border: '1px solid rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.06)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: '#C9A96E' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              <div>
                <p className="font-body uppercase tracking-[0.2em] transition-colors duration-300" style={{ fontSize: '13px', color: 'rgba(245,240,232,0.55)' }}>
                  Drag & drop or tap to upload
                </p>
                <p className="font-body mt-2" style={{ fontSize: '11px', color: 'rgba(245,240,232,0.28)' }}>
                  JPG · PNG · TIFF — minimum 300 DPI recommended
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div variants={stagger.item} className="flex flex-col gap-4">
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!config.artwork.previewUrl}
          whileHover={config.artwork.previewUrl ? { scale: 1.01 } : {}}
          whileTap={config.artwork.previewUrl ? { scale: 0.99 } : {}}
          className="w-full flex items-center justify-center gap-3 focus:outline-none transition-all duration-300"
          style={{
            padding: '18px',
            fontSize: '12px',
            fontFamily: 'inherit',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            background: config.artwork.previewUrl
              ? 'linear-gradient(135deg, #C9A96E, #A07840)'
              : 'rgba(255,255,255,0.05)',
            color: config.artwork.previewUrl ? '#12100E' : 'rgba(245,240,232,0.25)',
            cursor: config.artwork.previewUrl ? 'pointer' : 'not-allowed',
            boxShadow: config.artwork.previewUrl ? '0 4px 24px rgba(201,169,110,0.25)' : 'none',
          }}
        >
          Continue to Size
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
        <button
          type="button"
          onClick={() => { onChange({ file: null, previewUrl: null, provided: false }); onNext() }}
          className="w-full font-body uppercase tracking-[0.2em] transition-colors focus:outline-none"
          style={{ padding: '12px', fontSize: '11px', color: 'rgba(245,240,232,0.3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.3)')}
        >
          Skip — I&apos;ll attach my photo later
        </button>
      </motion.div>
    </motion.div>
  )
}
