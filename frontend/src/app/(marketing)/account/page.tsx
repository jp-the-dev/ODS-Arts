'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/store/auth'
import { useWishlist } from '@/lib/store/wishlist'
import { updateProfile, updatePassword } from '@/lib/services/auth'
import { createAddress, deleteAddress, updateAddress } from '@/lib/services/addresses'
import { getOrders } from '@/lib/services/orders'
import type { UpdateProfileInput, UpdatePasswordInput } from '@/lib/services/auth'
import type { Address } from '@/lib/services/addresses'
import type { Order } from '@/lib/services/orders'

function ProfileSection() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone ?? '')
    }
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setSubmitting(true)
    try {
      const input: UpdateProfileInput = {}
      if (name !== user?.name) input.name = name
      if (email !== user?.email) input.email = email
      if (phone !== (user?.phone ?? '')) input.phone = phone || null
      if (Object.keys(input).length === 0) {
        setMessage('No changes to save.')
        return
      }
      await updateProfile(input)
      await refreshUser()
      setMessage('Profile updated successfully.')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="font-display-heading text-h4 text-obsidian mb-6">Profile</h2>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-body">{message}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-body">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">Name</label>
          <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors" />
        </div>
        <div>
          <label htmlFor="email" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors" />
        </div>
        <div>
          <label htmlFor="phone" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">Phone</label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors" />
        </div>
        <button type="submit" disabled={submitting}
          className="px-6 py-3 bg-obsidian text-ivory font-body text-label uppercase tracking-label hover:bg-obsidian/90 transition-colors disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </section>
  )
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (newPassword !== newPasswordConfirmation) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const input: UpdatePasswordInput = { current_password: currentPassword, new_password: newPassword, new_password_confirmation: newPasswordConfirmation }
      await updatePassword(input)
      setMessage('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirmation('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="font-display-heading text-h4 text-obsidian mb-6">Change Password</h2>
      {message && (<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-body">{message}</div>)}
      {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-body">{error}</div>)}
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="current_password" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">Current Password</label>
          <input id="current_password" type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors" />
        </div>
        <div>
          <label htmlFor="new_password" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">New Password</label>
          <input id="new_password" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors" />
        </div>
        <div>
          <label htmlFor="new_password_confirmation" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">Confirm New Password</label>
          <input id="new_password_confirmation" type="password" required minLength={8} value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)}
            className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors" />
        </div>
        <button type="submit" disabled={submitting}
          className="px-6 py-3 bg-obsidian text-ivory font-body text-label uppercase tracking-label hover:bg-obsidian/90 transition-colors disabled:opacity-50">
          {submitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  )
}

type AddressFormData = {
  label: string
  type: string
  is_default: boolean
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
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
  const [country, setCountry] = useState(address?.country ?? 'IN')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const input = { label, type, is_default: isDefault, full_name: fullName, phone, address_line1: line1, address_line2: line2 || null, city, state, postal_code: postalCode, country }
      await onSave(input as any)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 border border-obsidian/15 bg-ivory text-obsidian font-body text-sm focus:outline-none focus:border-obsidian/40 transition-colors'
  const labelClass = 'block font-body text-[10px] uppercase tracking-label text-obsidian/60 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Label</label>
          <select value={label} onChange={(e) => setLabel(e.target.value)} required className={inputClass}>
            <option value="">Select...</option>
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="both">Shipping & Billing</option>
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Full Name</label>
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Address Line 1</label>
        <input type="text" required value={line1} onChange={(e) => setLine1(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Address Line 2 (optional)</label>
        <input type="text" value={line2} onChange={(e) => setLine2(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>City</label>
          <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Postal Code</label>
          <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />
        </div>
      </div>
      <label className="flex items-center gap-2 font-body text-sm text-obsidian/60 cursor-pointer">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="accent-obsidian" />
        Set as default address
      </label>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={submitting}
          className="px-4 py-2.5 bg-obsidian text-ivory font-body text-[10px] uppercase tracking-label hover:bg-obsidian/90 transition-colors disabled:opacity-50">
          {submitting ? 'Saving...' : address ? 'Update' : 'Add Address'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 border border-obsidian/15 text-obsidian font-body text-[10px] uppercase tracking-label hover:bg-obsidian/5 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

function AddressesSection() {
  const { user, refreshUser } = useAuth()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  async function handleCreate(input: AddressFormData) {
    await createAddress(input)
    await refreshUser()
    setAdding(false)
  }

  async function handleUpdate(id: number, input: AddressFormData) {
    await updateAddress(id, input)
    await refreshUser()
    setEditingId(null)
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this address?')) {
      await deleteAddress(id)
      await refreshUser()
    }
  }

  const addresses = user?.addresses ?? []

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display-heading text-h4 text-obsidian">Addresses</h2>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="font-body text-[10px] uppercase tracking-label text-obsidian/50 hover:text-obsidian transition-colors">
            + Add Address
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-6 p-4 border border-obsidian/10">
          <AddressForm onSave={handleCreate} onCancel={() => setAdding(false)} />
        </div>
      )}

      {addresses.length === 0 && !adding && (
        <p className="font-body text-sm text-obsidian/40">No addresses saved yet.</p>
      )}

      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="p-4 border border-obsidian/10">
            {editingId === addr.id ? (
              <AddressForm
                address={addr}
                onSave={(input) => handleUpdate(addr.id, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex justify-between gap-4">
                <div className="font-body text-sm text-obsidian space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{addr.label}</span>
                    {addr.is_default && <span className="text-[10px] uppercase tracking-label text-obsidian/40">(Default)</span>}
                  </div>
                  <p>{addr.full_name} &middot; {addr.phone}</p>
                  <p>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                  <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                  <p className="text-[10px] uppercase tracking-label text-obsidian/30">{addr.type}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => setEditingId(addr.id)}
                    className="font-body text-[10px] uppercase tracking-label text-obsidian/40 hover:text-obsidian transition-colors">Edit</button>
                  <button onClick={() => handleDelete(addr.id)}
                    className="font-body text-[10px] uppercase tracking-label text-red-400 hover:text-red-600 transition-colors">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Orders ─────────────────────────────────────────────────────────────────────

function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    getOrders().then((data) => setOrders(data ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section>
        <h2 className="font-display-heading text-h4 text-obsidian mb-6">Orders</h2>
        <p className="font-body text-sm text-obsidian/40">Loading orders...</p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="font-display-heading text-h4 text-obsidian mb-6">Orders</h2>

      {orders.length === 0 ? (
        <p className="font-body text-sm text-obsidian/40">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="border border-obsidian/10">
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-obsidian/[0.02] transition-colors"
              >
                <div className="font-body text-sm text-obsidian space-y-0.5">
                  <span className="font-semibold">{order.order_number}</span>
                  <div className="text-[11px] text-obsidian/50">
                    {new Date(order.ordered_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    <span className="mx-2">&middot;</span>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-body text-sm font-semibold text-obsidian">{formatRupees(order.total)}</div>
                  <span className="font-body text-[10px] uppercase tracking-label text-obsidian/40">{order.status}</span>
                </div>
              </button>

              {expanded === order.id && (
                <div className="border-t border-obsidian/10 px-4 py-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between font-body text-sm text-obsidian">
                      <span>{item.name} <span className="text-obsidian/40">x{item.quantity}</span></span>
                      <span>{formatRupees(item.subtotal_paise)}</span>
                    </div>
                  ))}
                  <div className="border-t border-obsidian/10 pt-2 flex justify-between font-body text-sm font-semibold text-obsidian">
                    <span>Total</span>
                    <span>{formatRupees(order.total)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Wishlist ───────────────────────────────────────────────────────────────────

function WishlistSection() {
  const { slugs, removeFromWishlist } = useWishlist()

  if (slugs.length === 0) {
    return (
      <section>
        <h2 className="font-display-heading text-h4 text-obsidian mb-6">Wishlist</h2>
        <p className="font-body text-sm text-obsidian/40">Your wishlist is empty.</p>
        <Link href="/collections"
          className="inline-block mt-4 font-body text-[10px] uppercase tracking-label text-gold hover:text-walnut transition-colors">
          Browse Collections &rarr;
        </Link>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display-heading text-h4 text-obsidian">Wishlist</h2>
        <span className="font-body text-[10px] uppercase tracking-label text-obsidian/40">{slugs.length} saved</span>
      </div>

      <div className="space-y-2">
        {slugs.map((slug) => (
          <div key={slug} className="flex items-center justify-between px-4 py-3 border border-obsidian/10">
            <Link href={`/products/${slug}`}
              className="font-body text-sm text-obsidian hover:text-walnut transition-colors">
              {slug}
            </Link>
            <button onClick={() => removeFromWishlist(slug)}
              className="font-body text-[10px] uppercase tracking-label text-red-400 hover:text-red-600 transition-colors">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/wishlist"
          className="font-body text-[10px] uppercase tracking-label text-gold hover:text-walnut transition-colors">
          View Full Wishlist &rarr;
        </Link>
      </div>
    </section>
  )
}

function formatRupees(paise: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100)
}

export default function AccountPage() {
  const { user, logout } = useAuth()

  return (
    <AuthGuard>
      <main className="bg-ivory min-h-screen pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display-heading text-h3 text-obsidian">My Account</h1>
              <p className="font-body text-body text-obsidian/60 mt-1">Welcome back, {user?.name}</p>
            </div>
            <button onClick={logout}
              className="font-body text-label uppercase tracking-label text-obsidian/50 hover:text-obsidian transition-colors">Sign Out</button>
          </div>

          <div className="space-y-12">
            <ProfileSection />
            <hr className="border-obsidian/10" />
            <OrdersSection />
            <hr className="border-obsidian/10" />
            <WishlistSection />
            <hr className="border-obsidian/10" />
            <AddressesSection />
            <hr className="border-obsidian/10" />
            <PasswordSection />
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}
