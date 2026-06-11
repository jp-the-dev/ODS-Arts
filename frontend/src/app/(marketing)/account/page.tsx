'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/store/auth'
import { useWishlist } from '@/lib/store/wishlist'
import { updateProfile, updatePassword } from '@/lib/services/auth'
import { createAddress, deleteAddress, updateAddress } from '@/lib/services/addresses'
import { getOrders } from '@/lib/services/orders'
import { getWishlist } from '@/lib/services/wishlist'
import type { UpdateProfileInput, UpdatePasswordInput } from '@/lib/services/auth'
import type { Address } from '@/lib/services/addresses'
import type { Order } from '@/lib/services/orders'
import TrackingDrawer from '@/components/account/TrackingDrawer'
import type { WishlistItem } from '@/lib/services/wishlist'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRupees(paise: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100)
}

const statusColors: Record<string, string> = {
  pending_payment: 'text-amber-600 bg-amber-50 border-amber-200',
  confirmed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  shipped: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
}

const statusLabel: Record<string, string> = {
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// ── Input styles ──────────────────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-3 bg-transparent border border-obsidian/15 text-obsidian font-body text-sm placeholder:text-obsidian/25 focus:outline-none focus:border-obsidian/50 hover:border-obsidian/30 transition-colors duration-200'
const labelCls = 'block font-body text-[10px] uppercase tracking-[0.22em] text-obsidian/50 mb-1.5'

// ── Stagger animation variants ─────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0, 0, 1] as any } },
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, subtitle, children, action }: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <motion.section variants={itemVariants} className="py-10 border-b border-obsidian/8 last:border-0">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold mb-1">{subtitle ?? 'Account'}</p>
          <h2 className="font-display text-[clamp(22px,2.5vw,30px)] text-obsidian">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

// ── Feedback messages ─────────────────────────────────────────────────────────

function Feedback({ message, error }: { message?: string | null; error?: string | null }) {
  return (
    <AnimatePresence>
      {(message || error) && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="mb-5 overflow-hidden"
        >
          <div className={`flex items-center gap-3 px-4 py-3 border text-[13px] font-body ${
            error
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${error ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            {error || message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Profile Section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); setPhone(user.phone ?? '') }
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null); setError(null); setSubmitting(true)
    try {
      const input: UpdateProfileInput = {}
      if (name !== user?.name) input.name = name
      if (email !== user?.email) input.email = email
      if (phone !== (user?.phone ?? '')) input.phone = phone || null
      if (Object.keys(input).length === 0) { setMessage('No changes to save.'); return }
      await updateProfile(input)
      await refreshUser()
      setMessage('Profile updated successfully.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section title="Profile" subtitle="Personal info">
      <Feedback message={message} error={error} />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
        <div className="sm:col-span-2">
          <label className={labelCls}>Full Name</label>
          <input id="name" type="text" required value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Your name" />
        </div>
        <div>
          <label className={labelCls}>Email Address</label>
          <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
        </div>
        <div>
          <label className={labelCls}>Phone Number</label>
          <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+91 98765 43210" />
        </div>
        <div className="sm:col-span-2">
          <motion.button
            type="submit" disabled={submitting} whileTap={{ scale: 0.98 }}
            className="relative group px-8 py-3 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] overflow-hidden disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-walnut translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0,0,1)]" />
            <span className="relative">{submitting ? 'Saving…' : 'Save Changes'}</span>
          </motion.button>
        </div>
      </form>
    </Section>
  )
}

// ── Password Section ──────────────────────────────────────────────────────────

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null); setError(null)
    if (newPassword !== newPasswordConfirmation) { setError('Passwords do not match.'); return }
    setSubmitting(true)
    try {
      await updatePassword({ current_password: currentPassword, new_password: newPassword, new_password_confirmation: newPasswordConfirmation })
      setMessage('Password updated successfully.')
      setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirmation('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section title="Change Password" subtitle="Security">
      <Feedback message={message} error={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        {[
          { id: 'cur', label: 'Current Password', val: currentPassword, set: setCurrentPassword },
          { id: 'new', label: 'New Password', val: newPassword, set: setNewPassword },
          { id: 'con', label: 'Confirm New Password', val: newPasswordConfirmation, set: setNewPasswordConfirmation },
        ].map(({ id, label, val, set }) => (
          <div key={id}>
            <label className={labelCls}>{label}</label>
            <input type="password" required minLength={8} value={val} onChange={e => set(e.target.value)} className={inputCls} />
          </div>
        ))}
        <motion.button
          type="submit" disabled={submitting} whileTap={{ scale: 0.98 }}
          className="relative group mt-2 px-8 py-3 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] overflow-hidden disabled:opacity-50"
        >
          <span className="absolute inset-0 bg-walnut translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0,0,1)]" />
          <span className="relative">{submitting ? 'Updating…' : 'Update Password'}</span>
        </motion.button>
      </form>
    </Section>
  )
}

// ── Orders Section ────────────────────────────────────────────────────────────

function OrdersSection() {
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null)

  useEffect(() => {
    getOrders().then(d => setOrders(d ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Section title="My Orders" subtitle="Purchase history">
      {/* Tracking drawer — rendered at section root so it overlays page */}
      <TrackingDrawer
        orderNumber={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      {loading ? (
        <div className="flex items-center gap-3 py-8 text-obsidian/40">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"/>
          </svg>
          <span className="font-body text-[13px]">Loading orders…</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-obsidian/15">
          <p className="font-body text-[13px] text-obsidian/40 mb-4">No orders placed yet.</p>
          <Link href="/collections" className="font-body text-[11px] uppercase tracking-[0.2em] text-gold hover:text-walnut transition-colors">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-obsidian/8 border border-obsidian/10">
          {orders.map((order, i) => (
            <div key={order.id}>
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-obsidian/[0.025] transition-colors duration-200 group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-body text-[13px] font-medium text-obsidian tracking-wide">{order.order_number}</span>
                  <span className="font-body text-[11px] text-obsidian/45">
                    {new Date(order.ordered_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    &nbsp;·&nbsp;{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-body text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border rounded-full ${statusColors[order.status] ?? 'text-obsidian/50 bg-obsidian/5 border-obsidian/10'}`}>
                    {statusLabel[order.status] ?? order.status}
                  </span>
                  <span className="font-display text-[15px] text-obsidian">{formatRupees(order.total)}</span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`text-obsidian/30 transition-transform duration-300 ${expanded === order.id ? 'rotate-180' : ''}`}
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 bg-obsidian/[0.018] border-t border-obsidian/8 space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between font-body text-[13px] text-obsidian">
                          <span>{item.name} <span className="text-obsidian/40">× {item.quantity}</span></span>
                          <span>{formatRupees(item.subtotal_paise)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-obsidian/8 flex justify-between font-body text-[13px] font-medium text-obsidian">
                        <span>Total</span>
                        <span>{formatRupees(order.total)}</span>
                      </div>

                      {/* Shipping info row */}
                      {(order.courier_name || order.awb_code) && (
                        <div className="pt-2 border-t border-obsidian/8 flex flex-wrap items-center gap-3">
                          {order.courier_name && (
                            <span className="font-body text-[11px] text-obsidian/50">
                              via {order.courier_name}
                            </span>
                          )}
                          {order.awb_code && (
                            <span className="font-body text-[11px] text-obsidian/40 font-mono">
                              AWB: {order.awb_code}
                            </span>
                          )}
                          {order.estimated_delivery_date && (
                            <span className="font-body text-[11px] text-gold">
                              ETA: {order.estimated_delivery_date}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Track Shipment button */}
                      {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                        <div className="pt-2">
                          <button
                            onClick={() => setTrackingOrder(order.order_number)}
                            className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-gold hover:text-walnut transition-colors duration-200 group"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Track Shipment
                            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="opacity-50 group-hover:translate-x-0.5 transition-transform duration-200">
                              <path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ── Wishlist Section ──────────────────────────────────────────────────────────

function WishlistSection() {
  const { removeFromWishlist } = useWishlist()
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getWishlist()
      .then(data => setItems(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  // Products live at /collections/[collectionSlug] or fall back to /products/[slug]
  function getProductLink(item: WishlistItem): string {
    if (item.product.collection_slug) {
      return `/collections/${item.product.collection_slug}`
    }
    return `/products/${item.product.slug}`
  }

  function handleRemove(item: WishlistItem) {
    removeFromWishlist(item.product.slug)
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  return (
    <Section title="Wishlist" subtitle="Saved items" action={
      items.length > 0 ? (
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-obsidian/40">{items.length} saved</span>
      ) : undefined
    }>
      {loading ? (
        <div className="flex items-center gap-3 py-8 text-obsidian/40">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"/>
          </svg>
          <span className="font-body text-[13px]">Loading wishlist…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-obsidian/15">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-obsidian/20">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="font-body text-[13px] text-obsidian/40 mb-4">Your wishlist is empty.</p>
          <Link href="/collections" className="font-body text-[11px] uppercase tracking-[0.2em] text-gold hover:text-walnut transition-colors">
            Browse Collections →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="group relative border border-obsidian/10 hover:border-obsidian/25 transition-colors duration-300 overflow-hidden"
              >
                <Link href={getProductLink(item)} className="flex items-center gap-4 p-4 pr-12">
                  {/* Product thumbnail */}
                  <div className="w-14 h-14 bg-obsidian/5 flex-shrink-0 overflow-hidden">
                    {item.product.thumbnail ? (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        width={56} height={56}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-obsidian/15">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] text-obsidian leading-tight truncate">{item.product.name}</p>
                    {item.product.tagline && (
                      <p className="font-body text-[11px] text-obsidian/45 mt-0.5 truncate">{item.product.tagline}</p>
                    )}
                    {item.product.price > 0 && (
                      <p className="font-body text-[12px] text-gold mt-1">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.product.price)}
                      </p>
                    )}
                  </div>
                  {/* Arrow indicator */}
                  <svg
                    width="13" height="13" viewBox="0 0 14 14" fill="none"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian/20 group-hover:text-obsidian/60 group-hover:translate-x-0.5 transition-all duration-300"
                  >
                    <path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item)}
                  className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-obsidian/20 hover:text-rose-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Remove from wishlist"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Section>
  )
}

// ── Addresses Section ─────────────────────────────────────────────────────────

type AddressFormData = {
  label: string; type: string; is_default: boolean; full_name: string; phone: string
  address_line1: string; address_line2: string | null; city: string; state: string
  postal_code: string; country: string
}

function AddressForm({ address, onSave, onCancel }: {
  address?: Address
  onSave: (input: AddressFormData) => Promise<void>
  onCancel: () => void
}) {
  const [label, setLabel] = useState(address?.label ?? '')
  const [type, setType] = useState(address?.type ?? 'both')
  const [isDefault, setIsDefault] = useState(address?.is_default ?? false)
  const [fullName, setFullName] = useState(address?.full_name ?? '')
  const [phone, setPhone] = useState(address?.phone ?? '')
  const [line1, setLine1] = useState(address?.address_line1 ?? '')
  const [line2, setLine2] = useState(address?.address_line2 ?? '')
  const [city, setCity] = useState(address?.city ?? '')
  const [state, setState] = useState(address?.state ?? '')
  const [postalCode, setPostalCode] = useState(address?.postal_code ?? '')
  const [country] = useState(address?.country ?? 'IN')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSave({ label, type, is_default: isDefault, full_name: fullName, phone, address_line1: line1, address_line2: line2 || null, city, state, postal_code: postalCode, country })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 border border-obsidian/15 bg-ivory mb-5"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Label</label>
            <select value={label} onChange={e => setLabel(e.target.value)} required className={inputCls}>
              <option value="">Select…</option>
              {['Home', 'Work', 'Office', 'Other'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
              <option value="both">Shipping & Billing</option>
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Full Name</label><input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Phone</label><input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Address Line 1</label><input type="text" required value={line1} onChange={e => setLine1(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Address Line 2 (optional)</label><input type="text" value={line2} onChange={e => setLine2(e.target.value)} className={inputCls} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className={labelCls}>City</label><input type="text" required value={city} onChange={e => setCity(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>State</label><input type="text" required value={state} onChange={e => setState(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Postal Code</label><input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className={inputCls} /></div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="accent-obsidian w-3.5 h-3.5" />
          <span className="font-body text-[12px] text-obsidian/55">Set as default address</span>
        </label>
        <div className="flex gap-3 pt-1">
          <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-obsidian text-ivory font-body text-[10px] uppercase tracking-[0.2em] hover:bg-walnut transition-colors disabled:opacity-50">
            {submitting ? 'Saving…' : address ? 'Update' : 'Add Address'}
          </motion.button>
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 border border-obsidian/20 text-obsidian font-body text-[10px] uppercase tracking-[0.2em] hover:bg-obsidian/5 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  )
}

function AddressesSection() {
  const { user, refreshUser } = useAuth()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  async function handleCreate(input: AddressFormData) { await createAddress(input); await refreshUser(); setAdding(false) }
  async function handleUpdate(id: number, input: AddressFormData) { await updateAddress(id, input); await refreshUser(); setEditingId(null) }
  async function handleDelete(id: number) {
    if (confirm('Delete this address?')) { await deleteAddress(id); await refreshUser() }
  }

  const addresses = user?.addresses ?? []

  return (
    <Section title="Saved Addresses" subtitle="Delivery" action={
      !adding ? (
        <button onClick={() => setAdding(true)}
          className="font-body text-[10px] uppercase tracking-[0.2em] text-obsidian/40 hover:text-obsidian transition-colors flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> Add
        </button>
      ) : undefined
    }>
      {adding && <AddressForm onSave={handleCreate} onCancel={() => setAdding(false)} />}
      {addresses.length === 0 && !adding && (
        <div className="py-10 text-center border border-dashed border-obsidian/15">
          <p className="font-body text-[13px] text-obsidian/40">No addresses saved yet.</p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {addresses.map((addr) => (
          <div key={addr.id} className="border border-obsidian/10 overflow-hidden">
            {editingId === addr.id ? (
              <AddressForm address={addr} onSave={input => handleUpdate(addr.id, input)} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="flex justify-between gap-4 p-5">
                <div className="font-body text-[13px] text-obsidian space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-body text-[10px] uppercase tracking-[0.2em] text-obsidian">{addr.label}</span>
                    {addr.is_default && <span className="text-[9px] uppercase tracking-[0.15em] bg-gold/15 text-gold px-2 py-0.5">Default</span>}
                  </div>
                  <p className="text-obsidian/70">{addr.full_name} · {addr.phone}</p>
                  <p className="text-obsidian/60">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                  <p className="text-obsidian/60">{addr.city}, {addr.state} {addr.postal_code}</p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <button onClick={() => setEditingId(addr.id)} className="font-body text-[10px] uppercase tracking-[0.18em] text-obsidian/40 hover:text-obsidian transition-colors">Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="font-body text-[10px] uppercase tracking-[0.18em] text-rose-400 hover:text-rose-600 transition-colors">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}

// ── Navigation tabs ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
] as const

type TabId = typeof TABS[number]['id']

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('orders')

  return (
    <AuthGuard>
      <main className="bg-ivory min-h-screen">
        {/* ── Hero header ── */}
        <div className="bg-obsidian pt-28 pb-12 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0, 0, 1] }}
              className="flex items-end justify-between"
            >
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.35em] text-gold mb-2">My Account</p>
                <h1 className="font-display text-[clamp(28px,4vw,48px)] text-ivory leading-tight">
                  {user?.name?.split(' ')[0]}
                </h1>
                <p className="font-body text-[13px] text-ivory/40 mt-1">{user?.email}</p>
              </div>
              <motion.button
                onClick={logout}
                whileTap={{ scale: 0.96 }}
                className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/40 hover:text-ivory border border-ivory/15 hover:border-ivory/40 px-5 py-2.5 transition-all duration-300"
              >
                Sign Out
              </motion.button>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex gap-0 mt-10 overflow-x-auto"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-3 font-body text-[11px] uppercase tracking-[0.2em] transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-ivory'
                      : 'text-ivory/35 hover:text-ivory/65'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="account-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold"
                      transition={{ duration: 0.3, ease: [0.25, 0, 0, 1] }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.25, 0, 0, 1] }}
            >
              <motion.div variants={containerVariants} initial="hidden" animate="show">
                {activeTab === 'orders' && <OrdersSection />}
                {activeTab === 'wishlist' && <WishlistSection />}
                {activeTab === 'addresses' && <AddressesSection />}
                {activeTab === 'profile' && <ProfileSection />}
                {activeTab === 'security' && <PasswordSection />}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </AuthGuard>
  )
}
