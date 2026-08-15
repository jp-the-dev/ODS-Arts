'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FormState {
  name: string
  email: string
  phone: string
  message: string
}

const EMPTY: FormState = { name: '', email: '', phone: '', message: '' }

/**
 * Corporate gifting enquiry. Posts to /api/contact, which forwards to Laravel
 * as an enquiry of type `gifting` so it lands in the same Filament inbox as
 * every other lead, filterable by type.
 */
export default function GiftingLeadForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate(data: FormState): Record<string, string> {
    const next: Record<string, string> = {}
    if (!data.name.trim()) next.name = 'Please tell us your name'
    if (!data.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      next.email = 'Enter a valid email'
    if (!data.message.trim()) next.message = 'Tell us a little about what you need'
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const found = validate(form)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'gifting' }),
      })

      if (!res.ok) {
        // 422 carries Laravel's field errors; anything else is a generic failure.
        const body = await res.json().catch(() => null)
        setErrors(
          res.status === 422 && body?.errors
            ? Object.fromEntries(
                Object.entries(body.errors as Record<string, string[]>).map(
                  ([key, messages]) => [key, messages[0]]
                )
              )
            : { form: 'Something went wrong. Please email hello@odsarts.in.' }
        )
        return
      }

      setSent(true)
      setForm(EMPTY)
    } catch {
      setErrors({ form: 'Something went wrong. Please email hello@odsarts.in.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}
        className="border border-gold/30 bg-ivory-200 px-8 py-12 text-center"
      >
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-gold mb-3">
          Enquiry Received
        </p>
        <h3 className="font-display text-[26px] text-obsidian mb-3">
          Thank you — we&apos;ll be in touch.
        </h3>
        <p className="font-body text-[13px] leading-[1.8] text-pewter-dark max-w-sm mx-auto">
          Our gifting team replies within one working day with sizing, bulk pricing
          and lead times.
        </p>
      </motion.div>
    )
  }

  const fieldClass =
    'w-full bg-transparent border-b border-obsidian/15 focus:border-gold outline-none py-3 font-body text-[14px] text-obsidian placeholder:text-pewter/60 transition-colors'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
      {[
        { name: 'name', label: 'Your name', type: 'text', placeholder: 'Priya Mehta' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'priya@company.com' },
        { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
      ].map((field) => (
        <div key={field.name}>
          <label
            htmlFor={`gift-${field.name}`}
            className="block font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1"
          >
            {field.label}
          </label>
          <input
            id={`gift-${field.name}`}
            name={field.name}
            type={field.type}
            value={form[field.name as keyof FormState]}
            onChange={handleChange}
            placeholder={field.placeholder}
            className={fieldClass}
            aria-invalid={Boolean(errors[field.name])}
          />
          {errors[field.name] && (
            <p data-field-error className="font-body text-[11px] text-red-700 mt-1.5">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      <div>
        <label
          htmlFor="gift-message"
          className="block font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1"
        >
          What are you gifting?
        </label>
        <textarea
          id="gift-message"
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          placeholder="50 frames for our team, delivered before Diwali…"
          className={`${fieldClass} resize-none`}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && (
          <p data-field-error className="font-body text-[11px] text-red-700 mt-1.5">
            {errors.message}
          </p>
        )}
      </div>

      {errors.form && (
        <p className="font-body text-[12px] text-red-700">{errors.form}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.25em] px-10 py-4 hover:bg-obsidian/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Sending…' : 'Request a gifting quote'}
      </button>
    </form>
  )
}
