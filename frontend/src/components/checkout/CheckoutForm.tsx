'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/store/cart'
import { useAuth } from '@/lib/store/auth'
import { useRouter } from 'next/navigation'
import { initiatePayment } from '@/lib/services/razorpay'
import { placeOrder, buildOrderRequest } from '@/services/orders.service'

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
  const { user, loading } = useAuth()
  const router = useRouter()

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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new')

  // Auto-fill from user profile (and default address) when loaded
  useEffect(() => {
    if (user && form.email === '') {
      const defaultAddr = user.addresses?.find(a => a.is_default) || user.addresses?.[0]
      
      setForm(prev => ({
        ...prev,
        fullName: defaultAddr?.full_name || user.name || '',
        email: user.email || '',
        phone: defaultAddr?.phone || user.phone || '',
        addressLine1: defaultAddr?.address_line1 || '',
        addressLine2: defaultAddr?.address_line2 || '',
        city: defaultAddr?.city || '',
        state: defaultAddr?.state || '',
        pincode: defaultAddr?.postal_code || '',
      }))

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      }
    }
  }, [user])

  function handleAddressSelect(addrId: number | 'new') {
    setSelectedAddressId(addrId)
    setErrors({})
    
    if (addrId === 'new') {
      // Clear address fields but keep contact
      setForm(prev => ({
        ...prev,
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
      }))
    } else {
      const addr = user?.addresses?.find(a => a.id === addrId)
      if (addr) {
        setForm(prev => ({
          ...prev,
          fullName: addr.full_name,
          phone: addr.phone,
          addressLine1: addr.address_line1,
          addressLine2: addr.address_line2 || '',
          city: addr.city,
          state: addr.state,
          pincode: addr.postal_code,
        }))
      }
    }
  }

  // Clear cart only once payment is confirmed
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
      const firstError = document.querySelector('[data-field-error]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await placeOrder(
        buildOrderRequest(form, items, subtotalPaise)
      )
      await attemptPayment(response.orderReference)
    } catch (error: any) {
      setErrors({ form: error?.message || 'Something went wrong. Please try again or contact us.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function attemptPayment(orderNumber: string) {
    try {
      await initiatePayment(orderNumber, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      })
      // ✅ Payment verified by backend — now show success
      setOrderRef(orderNumber)
    } catch (err: any) {
      const msg = err?.message ?? ''
      const isCancelled = msg === 'Payment cancelled'
      setErrors({
        form: isCancelled
          ? `Payment not completed. Your order (${orderNumber}) is saved — click "Retry Payment" to try again.`
          : `Payment failed. Your order (${orderNumber}) is saved — click "Retry Payment" to try again.`,
        _pendingOrder: orderNumber,
      })
    }
  }

  async function handleRetryPayment() {
    const pendingOrder = errors._pendingOrder
    if (!pendingOrder) return
    setErrors({})
    setIsSubmitting(true)
    try {
      await attemptPayment(pendingOrder)
    } finally {
      setIsSubmitting(false)
    }
  }


  // ── Success Screen ──────────────────────────────────────────────────────────

  if (orderRef) {
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
          Order Placed
        </p>
        <h1 className="font-display text-[clamp(32px,4vw,52px)] text-obsidian leading-tight mb-4">
          Your order has been placed.
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
          A confirmation email has been sent to{' '}
          <span className="text-obsidian font-medium">{form.email}</span>.
          Your order will begin processing once payment is confirmed.
        </p>

        {/* Delivery info */}
        <div className="flex flex-col gap-2 mb-10">
          {[
            'Handcrafted in our studio with museum-grade materials',
            'Estimated delivery: 7–14 working days after payment confirmation',
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
    <>
      {/* Login Prompt Overlay */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ivory border border-gold/30 p-8 max-w-sm w-full flex flex-col items-center text-center shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl text-obsidian mb-2">Sign in required</h3>
              <p className="font-body text-[13px] text-pewter leading-relaxed mb-8">
                Please log in or create an account to securely save your order and complete the payment.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  type="button"
                  onClick={() => router.push('/auth/login?redirect=/checkout')}
                  className="w-full py-3.5 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.2em] hover:bg-walnut transition-colors"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full py-3.5 border border-obsidian/20 text-obsidian font-body text-[11px] uppercase tracking-[0.2em] hover:bg-obsidian/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="flex items-end justify-between">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold mb-1">02</p>
            <h2 className="font-display text-[clamp(20px,2vw,28px)] text-obsidian">
              Delivery Address
            </h2>
            <div className="h-[1px] w-10 bg-gold/50 mt-3" />
          </div>
        </div>

        {/* Saved Addresses Selector */}
        {user?.addresses && user.addresses.length > 0 && (
          <div className="flex flex-col gap-3 mb-2">
            <label className="font-body text-[11px] uppercase tracking-[0.2em] text-obsidian">
              Saved Addresses
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.addresses.map(addr => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleAddressSelect(addr.id)}
                  className={`text-left p-4 border transition-all duration-300 ${
                    selectedAddressId === addr.id
                      ? 'border-obsidian bg-obsidian/5 shadow-inner'
                      : 'border-obsidian/15 hover:border-obsidian/40 bg-ivory'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-body text-[11px] uppercase tracking-[0.2em] font-medium text-obsidian">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="font-body text-[9px] uppercase tracking-[0.15em] bg-gold/15 text-gold px-1.5 py-0.5">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-body text-[13px] text-obsidian/70 truncate">{addr.address_line1}</p>
                  <p className="font-body text-[12px] text-obsidian/50">{addr.city}, {addr.postal_code}</p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleAddressSelect('new')}
                className={`flex flex-col items-center justify-center gap-2 p-4 border transition-all duration-300 min-h-[90px] ${
                  selectedAddressId === 'new'
                    ? 'border-obsidian bg-obsidian/5 shadow-inner'
                    : 'border-obsidian/15 border-dashed hover:border-obsidian/40 bg-ivory text-obsidian/60 hover:text-obsidian'
                }`}
              >
                <span className="text-xl leading-none">+</span>
                <span className="font-body text-[11px] uppercase tracking-[0.15em]">Enter new address</span>
              </button>
            </div>
          </div>
        )}

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
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-dark/10 border border-rose-dark/20 text-rose-dark text-[13px] font-body text-center"
          >
            {errors.form}
          </motion.div>
        )}

        {errors._pendingOrder && (
          <motion.button
            type="button"
            onClick={handleRetryPayment}
            disabled={isSubmitting}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 border border-obsidian/40 text-obsidian font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-3 hover:bg-obsidian hover:text-ivory transition-all duration-500 disabled:opacity-40"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Payment
          </motion.button>
        )}


        <motion.button
          type="submit"
          disabled={isSubmitting || items.length === 0 || loading}
          whileTap={{ scale: 0.99 }}
          className={`w-full py-5 font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-3 transition-all duration-500 focus:outline-none ${
            isSubmitting || items.length === 0 || loading
              ? 'bg-obsidian/30 text-ivory/50 cursor-not-allowed'
              : 'bg-obsidian text-ivory hover:bg-walnut'
          }`}
        >
          {isSubmitting || loading ? (
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
              {loading ? 'Verifying Session…' : 'Processing…'}
            </>
          ) : (
            <>
              Pay ₹{(subtotalPaise / 100).toLocaleString('en-IN')}
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
          Secured by <span className="text-obsidian">Razorpay</span>. Your payment
          information is encrypted and processed safely.
        </p>
      </div>
    </form>
    </>
  )
}
