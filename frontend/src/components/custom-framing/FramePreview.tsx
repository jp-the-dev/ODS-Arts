'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { FramingConfig } from '@/components/custom-framing/types'

const MATERIAL_STYLES: Record<string, { gradient: string; label: string }> = {
  walnut: { gradient: 'linear-gradient(160deg, #6B4C3B 0%, #3D2B1F 45%, #5C3D2E 100%)', label: 'Solid Walnut' },
  oak:    { gradient: 'linear-gradient(160deg, #C9AD87 0%, #A68B5B 45%, #C4A882 100%)', label: 'White Oak' },
  brass:  { gradient: 'linear-gradient(160deg, #D4B483 0%, #A07840 45%, #C9A96E 100%)', label: 'Brushed Brass' },
  black:  { gradient: 'linear-gradient(160deg, #333 0%, #1A1A1A 45%, #2A2A2A 100%)',    label: 'Matte Black' },
}

const MAT_WIDTH_PX: Record<string, number> = { none: 0, narrow: 14, standard: 24, wide: 38 }

const SIZE_RATIOS: Record<string, number> = {
  '4x6': 4/6, '5x7': 5/7, '8x10': 8/10, '11x14': 11/14,
  '16x20': 16/20, '18x24': 18/24, '24x36': 24/36,
}

interface FramePreviewProps {
  config: FramingConfig
  estimatedPrice: number | null
}

export default function FramePreview({ config, estimatedPrice }: FramePreviewProps) {
  const material = config.frame.material
  const matStyle = material ? (MATERIAL_STYLES[material] ?? null) : null
  const frameGradient = matStyle?.gradient ?? 'linear-gradient(160deg, #2A2A2A, #1A1A1A)'
  const frameThickness = material ? 22 : 4

  const aspectRatio = config.size.preset && config.size.preset !== 'custom'
    ? (SIZE_RATIOS[config.size.preset] ?? 0.75)
    : config.size.widthCm && config.size.heightCm
    ? config.size.widthCm / config.size.heightCm
    : 0.75

  const matPadding = config.mat.style !== 'none' ? (MAT_WIDTH_PX[config.mat.width] ?? 24) : 0
  const matColour = config.mat.style !== 'none' ? config.mat.colourHex : 'transparent'
  const hasDoubleMat = config.mat.style === 'double' || config.mat.style === 'museum'

  // Summary rows — built here so we can show them nicely
  const summaryRows = [
    {
      icon: '⬛',
      label: 'Size',
      value: config.size.preset && config.size.preset !== 'custom'
        ? config.size.preset.replace('x', ' × ') + ' in'
        : config.size.widthCm
        ? `${config.size.widthCm} × ${config.size.heightCm} ${config.size.unit}`
        : 'Not selected',
      set: !!config.size.preset,
    },
    {
      icon: '▭',
      label: 'Mat',
      value: config.mat.style === 'none'
        ? 'No mat'
        : config.mat.style
        ? `${config.mat.style.charAt(0).toUpperCase() + config.mat.style.slice(1)} · ${config.mat.colourLabel || '—'} · ${config.mat.width}`
        : 'Not selected',
      set: !!config.mat.style,
    },
    {
      icon: '◻',
      label: 'Frame',
      value: material
        ? `${MATERIAL_STYLES[material]?.label ?? ''} · ${config.frame.profile ?? '—'}`
        : 'Not selected',
      set: !!material && !!config.frame.profile,
    },
  ]

  return (
    <div className="flex flex-col w-full h-full px-6 py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10 gap-5 lg:gap-6 xl:gap-8 justify-center" style={{ maxWidth: '520px', margin: '0 auto' }}>

      {/* ── Studio label ── */}
      <div className="flex items-center gap-3">
        <div className="w-5 h-[1px]" style={{ background: '#C9A96E' }} />
        <span className="font-body uppercase tracking-[0.3em]" style={{ fontSize: '10px', color: 'rgba(201,169,110,0.7)' }}>
          Live Preview
        </span>
      </div>

      {/* ── Frame mockup — fills available width ── */}
      <div className="relative w-full flex items-center justify-center">
        <motion.div
          layout
          transition={{ duration: 0.55, ease: [0.25, 0, 0, 1] }}
          className="relative w-full"
          style={{ aspectRatio: `${aspectRatio}`, maxHeight: 'clamp(220px, 30vh, 400px)' }}
        >
          {/* Drop shadow backdrop */}
          <div
            className="absolute inset-0 rounded-[1px]"
            style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5)' }}
          />

          {/* Outer frame */}
          <motion.div
            layout
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-[1px]"
            style={{
              background: frameGradient,
              padding: `${frameThickness}px`,
              boxShadow: material
                ? 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)'
                : 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Mat layer */}
            <div
              className="w-full h-full relative flex items-center justify-center transition-all duration-500"
              style={{ backgroundColor: matColour, padding: `${matPadding}px` }}
            >
              {/* Double mat inner rule */}
              {hasDoubleMat && matPadding > 0 && (
                <div
                  className="absolute transition-all duration-500"
                  style={{ inset: '8px', border: `1px solid ${config.mat.colourHex}99` }}
                />
              )}

              {/* Artwork or placeholder */}
              <div
                className="relative w-full h-full overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(14,13,11,0.85)' }}
              >
                {config.artwork.previewUrl ? (
                  <Image
                    src={config.artwork.previewUrl}
                    alt="Your artwork preview"
                    fill
                    className="object-cover"
                    sizes="520px"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="font-display" style={{ fontSize: '40px', color: 'rgba(245,240,232,0.12)' }}>◎</span>
                    <span className="font-body uppercase tracking-[0.25em]" style={{ fontSize: '9px', color: 'rgba(245,240,232,0.2)' }}>
                      Your Photo Here
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Config summary — full width, generous spacing ── */}
      <div
        className="flex flex-col"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', gap: '0px' }}
      >
        {summaryRows.map(({ label, value, set }, i) => (
          <div
            key={label}
            className="flex items-start justify-between"
            style={{
              padding: '14px 0',
              borderBottom: i < summaryRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <span
              className="font-body uppercase tracking-[0.2em] flex-shrink-0"
              style={{ fontSize: '11px', color: 'rgba(245,240,232,0.35)', width: '64px', paddingTop: '1px' }}
            >
              {label}
            </span>
            <span
              className="font-body text-right leading-snug"
              style={{
                fontSize: '13px',
                color: set ? 'rgba(245,240,232,0.85)' : 'rgba(245,240,232,0.25)',
                fontStyle: set ? 'normal' : 'italic',
                maxWidth: '260px',
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Price estimate ── */}
      <motion.div
        animate={{ opacity: estimatedPrice ? 1 : 0, y: estimatedPrice ? 0 : 8 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex items-center justify-between"
        style={{ padding: '16px 20px', background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.2)' }}
      >
        <div>
          <p className="font-body uppercase tracking-[0.2em]" style={{ fontSize: '10px', color: 'rgba(201,169,110,0.6)' }}>
            Estimated from
          </p>
          <p className="font-body text-[11px] mt-0.5" style={{ color: 'rgba(245,240,232,0.35)' }}>
            Final quote prepared by our studio
          </p>
        </div>
        <span className="font-display" style={{ fontSize: '28px', color: '#C9A96E', letterSpacing: '-0.01em' }}>
          {estimatedPrice ? `₹${(estimatedPrice / 100).toLocaleString('en-IN')}` : '—'}
        </span>
      </motion.div>

    </div>
  )
}
