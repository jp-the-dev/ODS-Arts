'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api/client'
import { authHeaders, useAuth } from '@/lib/store/auth'
import { formatPrice } from '@/lib/types/product'

interface Address {
  id: number
  label: string
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

interface OrderItem {
  id: number
  name: string
  quantity: number
  subtotal_paise?: number
  subtotal?: number
}

interface Order {
  id: number
  order_number: string
  status: string
  payment_status: string
  total: number
  ordered_at: string | null
  items?: OrderItem[]
}

export default function AccountDashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Send signed-out visitors to login, remembering where they wanted to go.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?next=/account')
  }, [isLoading, isAuthenticated, router])

  const loadData = useCallback(async () => {
    try {
      const [addressData, orderData] = await Promise.all([
        apiFetch<Address[]>('/auth/addresses', { headers: authHeaders(), revalidate: false }),
        apiFetch<Order[]>('/auth/orders', { headers: authHeaders(), revalidate: false }),
      ])

      setAddresses(addressData ?? [])
      setOrders(orderData ?? [])
    } catch {
      // Leave the sections empty rather than blocking the whole page.
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    ;(async () => {
      if (!cancelled) await loadData()
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, loadData])

  async function handleDeleteAddress(id: number) {
    try {
      await apiFetch(`/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        revalidate: false,
      })
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch {
      // Non-fatal; the list refreshes on next load.
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="py-32 text-center font-body text-[13px] text-pewter">Loading…</div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-[1px] w-10 bg-gold/40" />
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
              Your Account
            </span>
          </div>
          <h1 className="font-display text-[clamp(30px,4vw,48px)] text-obsidian leading-tight">
            {user?.name}
          </h1>
          <p className="font-body text-[13px] text-pewter-dark mt-2">{user?.email}</p>
        </div>

        <button
          onClick={() => logout().then(() => router.push('/'))}
          className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border border-obsidian/25 hover:border-obsidian px-6 py-3 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Orders */}
      <section className="mb-16">
        <h2 className="font-display text-[24px] text-obsidian mb-6">Order history</h2>

        {loadingData ? (
          <p className="font-body text-[13px] text-pewter">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="border border-obsidian/10 bg-ivory-200/50 px-8 py-10">
            <p className="font-body text-[13px] text-pewter-dark mb-4">
              No orders yet — your first frame is waiting.
            </p>
            <Link
              href="/products"
              className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border-b border-gold/50 pb-1"
            >
              Browse frames
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-obsidian/8 border-y border-obsidian/8">
            {orders.map((order) => (
              <div key={order.id} className="py-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Link
                    href={`/orders/${order.order_number}`}
                    className="font-display text-[17px] text-obsidian tracking-wide hover:text-gold transition-colors"
                  >
                    {order.order_number}
                  </Link>
                  <p className="font-body text-[12px] text-pewter mt-1">
                    {order.ordered_at
                      ? new Date(order.ordered_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                      : '—'}
                    {order.items?.length ? ` · ${order.items.length} item${order.items.length > 1 ? 's' : ''}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <span
                    className={`font-body text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 ${
                      order.payment_status === 'paid'
                        ? 'text-obsidian bg-gold/20'
                        : 'text-pewter-dark bg-obsidian/5'
                    }`}
                  >
                    {order.payment_status === 'paid' ? 'Paid' : order.payment_status}
                  </span>
                  <span className="font-display text-[17px] text-obsidian">
                    {formatPrice(Number(order.total))}
                  </span>
                  <Link
                    href={`/orders/${order.order_number}`}
                    className="font-body text-[10px] uppercase tracking-[0.2em] text-pewter hover:text-obsidian transition-colors whitespace-nowrap"
                  >
                    Track →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Addresses */}
      <section>
        <h2 className="font-display text-[24px] text-obsidian mb-6">Saved addresses</h2>

        {loadingData ? (
          <p className="font-body text-[13px] text-pewter">Loading addresses…</p>
        ) : addresses.length === 0 ? (
          <div className="border border-obsidian/10 bg-ivory-200/50 px-8 py-10">
            <p className="font-body text-[13px] text-pewter-dark">
              No saved addresses yet. Addresses you use at checkout can be saved here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address.id} className="border border-obsidian/10 px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-[10px] uppercase tracking-[0.22em] text-pewter">
                    {address.label}
                  </span>
                  {address.is_default && (
                    <span className="font-body text-[9px] uppercase tracking-[0.2em] text-obsidian bg-gold/20 px-2 py-1">
                      Default
                    </span>
                  )}
                </div>

                <p className="font-body text-[13px] leading-[1.7] text-obsidian">
                  {address.full_name}
                  <br />
                  {address.address_line1}
                  {address.address_line2 ? <>, {address.address_line2}</> : null}
                  <br />
                  {address.city}, {address.state} {address.postal_code}
                  <br />
                  <span className="text-pewter">{address.phone}</span>
                </p>

                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="font-body text-[11px] uppercase tracking-[0.2em] text-pewter hover:text-obsidian transition-colors mt-4"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
