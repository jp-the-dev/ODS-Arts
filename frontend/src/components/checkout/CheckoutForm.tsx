'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/store/cart'
import { placeOrder, buildOrderRequest } from '@/services/orders.service'
import { payForOrder, type PaymentOutcome } from '@/services/payment.service'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  notes: string
}

interface FormErrors {
  [key: string]: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.fullName.trim()) errors.fullName = 'Full name is required'
  if (!data.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email'
  if (!data.phone.trim()) errors.phone = 'Phone number is required'
  else if (!/^\+?[\d\s\-()]{8,}$/.test(data.phone)) errors.phone = 'Enter a valid phone number'
  if (!data.addressLine1.trim()) errors.addressLine1 = 'Address is required'
  if (!data.city.trim()) errors.city = 'City is required'
  if (!data.state.trim()) errors.state = 'State is required'
  if (!data.pincode.trim()) errors.pincode = 'PIN code is required'
  else if (!/^\d{6}$/.test(data.pincode)) errors.pincode = 'Enter a valid 6-digit PIN'
  return errors
}

// ── Field Component ───────────────────────────────────────────────────────────

function Field({
  label,
  id,
  error,
  optional,
  children,
}: {
  label: string
  id: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-body text-[11px] uppercase tracking-[0.2em] text-obsidian flex items-center gap-2">
        {label}
        {optional && (
          <span className="text-pewter normal-case tracking-normal text-[10px]">(optional)</span>
        )}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-body text-[11px] text-rose-dark"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ── Input styles ──────────────────────────────────────────────────────────────

const inputClass = (error?: string) =>
  `w-full px-4 py-3.5 bg-ivory border font-body text-sm text-obsidian placeholder:text-pewter/50 focus:outline-none transition-colors duration-200 ${
    error
      ? 'border-rose-dark focus:border-rose-dark'
      : 'border-obsidian/20 focus:border-obsidian/60 hover:border-obsidian/40'
  }`

// ── Main Component ────────────────────────────────────────────────────────────

export default function CheckoutForm() {
  const { items, subtotalPaise, clearCart } = useCart()

  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderRef, setOrderRef] = useState<string | null>(null)
  const [payment, setPayment] = useState<PaymentOutcome | null>(null)

  // Clear cart and show success when orderRef is set
  useEffect(() => {
    if (orderRef) clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderRef])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstError = document.querySelector('[data-field-error]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)

    try {
      // The order is created first so an abandoned payment leaves a recoverable
      // order rather than losing the sale. Payment is attempted straight after.
      const response = await placeOrder(
        buildOrderRequest(form, items, subtotalPaise)
      )

      const outcome = await payForOrder(response.orderReference, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      })

      setPayment(outcome)
      setOrderRef(response.orderReference)
    } catch {
      // Surface a user-friendly error — real ApiValidationError handling
      // can be added here when the backend is live.
      setErrors({ form: 'Something went wrong. Please try again or contact us.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Success Screen ──────────────────────────────────────────────────────────

  if (orderRef) {
    // The screen must not claim payment was taken when it wasn't — an abandoned
    // or unconfigured payment still leaves a valid, recoverable order.
    const paid = payment?.status === 'paid'
    const eyebrow = paid ? 'Payment Received' : 'Order Placed'
    const heading = paid
      ? 'Your order is confirmed.'
      : 'Your order has been placed.'
    const message = paid
      ? 'A confirmation has been sent to'
      : payment?.status === 'pending'
        ? `${payment.reason} We'll email`
        : "We'll reach out to"
    const messageTail = paid
      ? '. We\u2019ll be in touch when it ships.'
      : payment?.status === 'pending'
        ? ' with a link to complete your payment.'
        : ' within 24 hours to confirm your order details and share a payment link.'

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0, 0, 1] }}
        className="flex flex-col items-center text-center py-16 px-6"
      >
        {/* Animated gold circle with checkmark */}
        <div className="relative w-20 h-20 mb-8">
          <motion.svg
            viewBox="0 0 80 80"
            fill="none"
            className="w-20 h-20"
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}
          >
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              stroke="#C9A96E"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: [0.25, 0, 0, 1] }}
            />
          </motion.svg>
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-8 h-8 absolute inset-0 m-auto"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7, ease: [0.25, 0, 0, 1] }}
          >
            <path
              d="M4 12l5 5 11-11"
              stroke="#C9A96E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>

        {/* Order confirmed */}
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-gold mb-3">
          {eyebrow}
        </p>
        <h1 className="font-display text-[clamp(32px,4vw,52px)] text-obsidian leading-tight mb-4">
          {heading}
        </h1>
        <div className="h-[1px] w-12 bg-gold/50 mb-6" />

        {/* Reference number */}
        <div className="bg-ivory-200 border border-obsidian/8 px-8 py-4 mb-6">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1">
            Order Reference
          </p>
          <p className="font-display text-2xl text-obsidian tracking-wider">{orderRef}</p>
        </div>

        {/* Message */}
        <p className="font-body text-[14px] leading-[1.8] text-pewter-dark max-w-sm mb-10">
          {message}{' '}
          <span className="text-obsidian font-medium">{form.email}</span>
          {messageTail}
        </p>

        {/* Delivery info */}
        <div className="flex flex-col gap-2 mb-10">
          {[
            'Handcrafted in our studio with museum-grade materials',
            'Estimated delivery: 7–14 working days after confirmation',
            'You\'ll receive tracking updates via WhatsApp & email',
          ].map((line, i) => (
            <div key={i} className="flex items-center gap-2.5 justify-center">
              <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
              <span className="font-body text-[12px] text-pewter-dark">{line}</span>
            </div>
          ))}
        </div>

        <Link
          href="/collections"
          className="inline-flex items-center gap-3 border border-obsidian/30 text-obsidian font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 hover:bg-obsidian hover:text-ivory transition-colors duration-500"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="opacity-60">
            <path
              d="M13 7H1M6 3L2 7l6 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Continue Exploring
        </Link>
      </motion.div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">

      {/* Empty cart warning */}
      <AnimatePresence>
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-gold/40 bg-gold/5 px-5 py-4"
          >
            <p className="font-body text-sm text-obsidian">
              Your cart is empty.{' '}
              <Link href="/collections" className="text-gold underline underline-offset-2">
                Browse collections
              </Link>{' '}
              before checking out.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 1: Contact ── */}
      <section className="flex flex-col gap-6">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold mb-1">01</p>
          <h2 className="font-display text-[clamp(20px,2vw,28px)] text-obsidian">
            Contact Details
          </h2>
          <div className="h-[1px] w-10 bg-gold/50 mt-3" />
        </div>

        <Field label="Full Name" id="fullName" error={errors.fullName}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Priya Sharma"
            value={form.fullName}
            onChange={handleChange}
            data-field-error={errors.fullName ? true : undefined}
            className={inputClass(errors.fullName)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Email Address" id="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="priya@example.com"
              value={form.email}
              onChange={handleChange}
              data-field-error={errors.email ? true : undefined}
              className={inputClass(errors.email)}
            />
          </Field>

          <Field label="Phone Number" id="phone" error={errors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              data-field-error={errors.phone ? true : undefined}
              className={inputClass(errors.phone)}
            />
          </Field>
        </div>
      </section>

      {/* ── Section 2: Address ── */}
      <section className="flex flex-col gap-6">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold mb-1">02</p>
          <h2 className="font-display text-[clamp(20px,2vw,28px)] text-obsidian">
            Delivery Address
          </h2>
          <div className="h-[1px] w-10 bg-gold/50 mt-3" />
        </div>

        <Field label="Address Line 1" id="addressLine1" error={errors.addressLine1}>
          <input
            id="addressLine1"
            name="addressLine1"
            type="text"
            autoComplete="address-line1"
            placeholder="Flat / House No., Building Name, Street"
            value={form.addressLine1}
            onChange={handleChange}
            data-field-error={errors.addressLine1 ? true : undefined}
            className={inputClass(errors.addressLine1)}
          />
        </Field>

        <Field label="Address Line 2" id="addressLine2" optional error={errors.addressLine2}>
          <input
            id="addressLine2"
            name="addressLine2"
            type="text"
            autoComplete="address-line2"
            placeholder="Area, Landmark"
            value={form.addressLine2}
            onChange={handleChange}
            className={inputClass()}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="City" id="city" error={errors.city}>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              placeholder="Ahmedabad"
              value={form.city}
              onChange={handleChange}
              data-field-error={errors.city ? true : undefined}
              className={inputClass(errors.city)}
            />
          </Field>

          <Field label="State" id="state" error={errors.state}>
            <input
              id="state"
              name="state"
              type="text"
              autoComplete="address-level1"
              placeholder="Gujarat"
              value={form.state}
              onChange={handleChange}
              data-field-error={errors.state ? true : undefined}
              className={inputClass(errors.state)}
            />
          </Field>

          <Field label="PIN Code" id="pincode" error={errors.pincode}>
            <input
              id="pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="380001"
              maxLength={6}
              value={form.pincode}
              onChange={handleChange}
              data-field-error={errors.pincode ? true : undefined}
              className={inputClass(errors.pincode)}
            />
          </Field>
        </div>
      </section>

      {/* ── Section 3: Order Confirmation ── */}
      <section className="flex flex-col gap-6">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold mb-1">03</p>
          <h2 className="font-display text-[clamp(20px,2vw,28px)] text-obsidian">
            Order Confirmation
          </h2>
          <div className="h-[1px] w-10 bg-gold/50 mt-3" />
        </div>

        {/* Items summary */}
        <div className="border border-obsidian/10 divide-y divide-obsidian/8">
          {items.map((item) => {
            const isArt    = item.itemType === 'art'
            const name     = isArt ? item.artProduct.name : item.product.name
            const subLabel = isArt
              ? `${item.artVariant.sizeLabel} · ${item.artVariant.material.replace('-', ' ')} · Qty ${item.quantity}`
              : `${item.variant.sizeLabel} · ${item.finish.name} · Qty ${item.quantity}`
            return (
              <div key={item.key} className="flex items-center justify-between px-5 py-4 gap-4">
                <div>
                  <p className="font-display text-[15px] text-obsidian">{name}</p>
                  <p className="font-body text-[11px] text-pewter mt-0.5">{subLabel}</p>
                </div>
                <p className="font-body text-sm text-obsidian tabular-nums flex-shrink-0">
                  ₹{(item.unitPricePaise * item.quantity / 100).toLocaleString('en-IN')}
                </p>
              </div>
            )
          })}

          {items.length === 0 && (
            <div className="px-5 py-6 text-center">
              <p className="font-body text-sm text-pewter">No items in cart.</p>
            </div>
          )}
        </div>

        {/* Delivery note */}
        <div className="flex items-start gap-3 bg-gold/5 border border-gold/20 px-5 py-4">
          <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0 mt-2" />
          <p className="font-body text-[12px] text-obsidian leading-relaxed">
            These are handcrafted-to-order pieces. Estimated delivery is{' '}
            <strong className="font-medium">7–14 working days</strong> from order confirmation.
          </p>
        </div>

        {/* Notes */}
        <Field label="Special Instructions" id="notes" optional>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Any special requests, hanging preferences, or gift message..."
            value={form.notes}
            onChange={handleChange}
            className={`${inputClass()} resize-none`}
          />
        </Field>
      </section>

      {/* ── Submit ── */}
      <div className="flex flex-col gap-4 border-t border-obsidian/8 pt-8">
        <motion.button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          whileTap={{ scale: 0.99 }}
          className={`w-full py-5 font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-3 transition-all duration-500 focus:outline-none ${
            isSubmitting || items.length === 0
              ? 'bg-obsidian/30 text-ivory/50 cursor-not-allowed'
              : 'bg-obsidian text-ivory hover:bg-walnut'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin w-4 h-4 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"
                />
              </svg>
              Placing Order…
            </>
          ) : (
            <>
              Place Order
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="opacity-60">
                <path
                  d="M1 7h12M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </motion.button>

        <p className="font-body text-[11px] text-center text-pewter leading-relaxed">
          You won&apos;t be charged online. Our team will confirm your order and share a{' '}
          <span className="text-obsidian">secure payment link</span> within 24 hours.
        </p>
      </div>
    </form>
  )
}
