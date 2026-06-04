'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ANIMATIONS } from '@/lib/config/animations'
import { placeQuoteRequest } from '@/services/customFraming.service'
import type { FramingConfig } from '@/components/custom-framing/types'

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  },
}

const MATERIAL_LABELS: Record<string, string> = {
  walnut: 'Solid Walnut', oak: 'White Oak', brass: 'Brushed Brass', black: 'Matte Black',
}

interface Step5Props {
  config: FramingConfig
  estimatedPrice: number | null
  onBack: () => void
}

export default function Step5Review({ config, estimatedPrice, onBack }: Step5Props) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quoteRef, setQuoteRef] = useState<string | null>(null)
  const [contactEmail, setContactEmail] = useState('hello@odsarts.in')

  function validate() {
    const e: Record<string, string> = {}
    if (!form.fullName.trim()) e.fullName = 'Required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Required'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsSubmitting(true)
    try {
      const sizePreset = config.size.preset ?? 'custom'
      const [w, h] = sizePreset !== 'custom'
        ? sizePreset.split('x').map(Number)
        : [config.size.widthCm ?? 0, config.size.heightCm ?? 0]

      const response = await placeQuoteRequest({
        artworkProvided: config.artwork.provided,
        artworkFilename: config.artwork.file?.name,
        size: {
          preset: sizePreset !== 'custom' ? sizePreset : undefined,
          widthCm: w * (config.size.unit === 'in' ? 2.54 : 1),
          heightCm: h * (config.size.unit === 'in' ? 2.54 : 1),
          unit: config.size.unit,
        },
        mat: {
          style: config.mat.style,
          colour: config.mat.colour,
          colourLabel: config.mat.colourLabel,
          width: config.mat.width,
        },
        frame: {
          material: config.frame.material!,
          finish: config.frame.finish ?? 'natural',
          profile: config.frame.profile!,
        },
        estimatedPriceFromPaise: estimatedPrice ?? 0,
        contact: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          notes: form.notes || undefined,
        },
      })
      setQuoteRef(response.quoteReference)
      setContactEmail(form.email)
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (quoteRef) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: ANIMATIONS.ease.luxury }}
        className="flex flex-col items-center text-center py-10"
      >
        {/* Animated gold checkmark circle */}
        <div className="relative w-20 h-20 mb-8">
          <motion.svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
            <motion.circle
              cx="40" cy="40" r="36"
              stroke="#C9A96E" strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: ANIMATIONS.ease.luxury }}
            />
          </motion.svg>
          <motion.svg
            viewBox="0 0 24 24" fill="none"
            className="w-8 h-8 absolute inset-0 m-auto"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8, ease: ANIMATIONS.ease.luxury }}
          >
            <path d="M4 12l5 5 11-11" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </div>

        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-gold mb-3">Quote Received</p>
        <h2 className="font-display text-[clamp(28px,3vw,42px)] text-ivory leading-tight mb-4">
          Your quote request<br />has been placed.
        </h2>
        <div className="h-[1px] w-10 bg-gold/40 mb-6" />

        <div className="border border-ivory/10 px-8 py-4 mb-6">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-ivory/40 mb-1">Reference</p>
          <p className="font-display text-2xl text-gold tracking-wider">{quoteRef}</p>
        </div>

        <p className="font-body text-[13px] text-ivory/50 leading-relaxed max-w-xs mb-8">
          We&apos;ll prepare a detailed quote and reach out to{' '}
          <span className="text-ivory/80">{contactEmail}</span>{' '}
          within 48 hours.
        </p>

        <div className="flex flex-col gap-2 mb-10">
          {[
            'Handcrafted in our studio with museum-grade materials',
            'Detailed pricing and production timeline in your quote',
            'Free revisions until you\'re completely satisfied',
          ].map((line, i) => (
            <div key={i} className="flex items-center gap-2.5 justify-center">
              <div className="w-1 h-1 rounded-full bg-gold/60 flex-shrink-0" />
              <span className="font-body text-[11px] text-ivory/40">{line}</span>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  const summaryItems = [
    { label: 'Artwork', value: config.artwork.provided ? config.artwork.file?.name ?? 'Uploaded' : 'To be attached later' },
    {
      label: 'Size',
      value: config.size.preset && config.size.preset !== 'custom'
        ? `${config.size.preset.replace('x', ' × ')} inches`
        : config.size.widthCm
        ? `${config.size.widthCm} × ${config.size.heightCm} ${config.size.unit}`
        : '—',
    },
    {
      label: 'Mat',
      value: config.mat.style === 'none'
        ? 'No mat'
        : `${config.mat.style.charAt(0).toUpperCase() + config.mat.style.slice(1)} · ${config.mat.colourLabel || '—'} · ${config.mat.width}`,
    },
    {
      label: 'Frame',
      value: config.frame.material
        ? `${MATERIAL_LABELS[config.frame.material]} · ${config.frame.finish ?? '—'} · ${config.frame.profile ?? '—'}`
        : '—',
    },
  ]

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-8"
    >
      {/* Heading */}
      <motion.div variants={stagger.item}>
        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold mb-2">Step 05</p>
        <h2 className="font-display text-[clamp(28px,3vw,44px)] text-ivory leading-tight">
          Review & Request
        </h2>
        <p className="font-body text-[13px] text-ivory/50 mt-3 leading-relaxed max-w-sm">
          Everything looks good? Leave your details and we&apos;ll prepare a detailed quote.
        </p>
      </motion.div>

      {/* Config summary */}
      <motion.div variants={stagger.item} className="border border-ivory/10 divide-y divide-ivory/8">
        {summaryItems.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-start px-4 py-3 gap-4">
            <span className="font-body text-[10px] uppercase tracking-[0.15em] text-ivory/30 flex-shrink-0">{label}</span>
            <span className="font-body text-[11px] text-ivory/70 text-right leading-snug">{value}</span>
          </div>
        ))}
        {estimatedPrice && (
          <div className="flex justify-between items-center px-4 py-3 bg-gold/5">
            <span className="font-body text-[10px] uppercase tracking-[0.15em] text-gold/60">Estimated from</span>
            <span className="font-display text-xl text-gold">₹{(estimatedPrice / 100).toLocaleString('en-IN')}</span>
          </div>
        )}
      </motion.div>

      {/* Contact form */}
      <motion.form variants={stagger.item} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {['fullName', 'email', 'phone'].map((field) => {
          const labels: Record<string, string> = { fullName: 'Full Name', email: 'Email Address', phone: 'Phone Number' }
          const placeholders: Record<string, string> = { fullName: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43210' }
          return (
            <div key={field} className="flex flex-col gap-1.5">
              <label htmlFor={`review-${field}`} className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/40">
                {labels[field]}
              </label>
              <input
                id={`review-${field}`}
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                placeholder={placeholders[field]}
                value={form[field as keyof typeof form]}
                onChange={(e) => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })) }}
                className={`bg-transparent border px-4 py-3 font-body text-sm text-ivory placeholder:text-ivory/20 focus:outline-none transition-colors ${
                  errors[field] ? 'border-rose-500/60' : 'border-ivory/20 focus:border-gold/50'
                }`}
              />
              {errors[field] && <p className="font-body text-[10px] text-rose-400">{errors[field]}</p>}
            </div>
          )
        })}

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="review-notes" className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/40">
            Notes <span className="text-ivory/25 normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="review-notes"
            rows={3}
            placeholder="Any special requests or additional details..."
            value={form.notes}
            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            className="bg-transparent border border-ivory/20 focus:border-gold/50 px-4 py-3 font-body text-sm text-ivory placeholder:text-ivory/20 focus:outline-none transition-colors resize-none"
          />
        </div>

        {errors.form && <p className="font-body text-[11px] text-rose-400">{errors.form}</p>}

        {/* Submit + back */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack}
            className="px-6 py-4 border border-ivory/15 text-ivory/50 hover:text-ivory/80 hover:border-ivory/30 font-body text-[11px] uppercase tracking-[0.2em] transition-colors focus:outline-none">
            Back
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.99 }}
            className={`flex-1 py-4 font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-3 transition-all duration-500 focus:outline-none
              ${isSubmitting ? 'bg-gold/40 text-obsidian/50 cursor-not-allowed' : 'bg-gold text-obsidian hover:bg-gold/90'}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"/>
                </svg>
                Sending…
              </>
            ) : (
              <>
                Request a Quote
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </>
            )}
          </motion.button>
        </div>

        <p className="font-body text-[10px] text-center text-ivory/25 leading-relaxed">
          No payment required. Our team will prepare a detailed quote and reach out within 48 hours.
        </p>
      </motion.form>
    </motion.div>
  )
}
