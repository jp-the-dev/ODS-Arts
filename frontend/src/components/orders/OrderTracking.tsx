'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch, ApiError } from '@/lib/api/client'
import { authHeaders } from '@/lib/store/auth'

interface Checkpoint {
  date?: string
  activity?: string
  location?: string
  status?: string
}

interface Tracking {
  orderReference: string
  status: string
  awbCode: string | null
  courierName: string | null
  currentStatus: string
  estimatedDelivery?: string | null
  checkpoints: Checkpoint[]
}

/** The journey every order takes, so progress is legible before any AWB exists. */
const STAGES = [
  { key: 'pending', label: 'Order placed', copy: 'We have your order.' },
  { key: 'confirmed', label: 'Confirmed', copy: 'Payment received, into the studio queue.' },
  { key: 'shipped', label: 'Shipped', copy: 'Handed to the courier.' },
  { key: 'delivered', label: 'Delivered', copy: 'On your wall, we hope.' },
] as const

function stageIndex(status: string): number {
  const found = STAGES.findIndex((s) => s.key === status.toLowerCase())

  // Cancelled/returned aren't on the happy path; show the first stage only.
  return found === -1 ? 0 : found
}

export default function OrderTracking({ orderNumber }: { orderNumber: string }) {
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Tracking>(
        `/orders/${encodeURIComponent(orderNumber)}/tracking`,
        { headers: authHeaders(), revalidate: false }
      )
      setTracking(data)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? 'We could not find that order. Check the reference and try again.'
          : 'We could not load tracking just now. Please try again shortly.'
      )
    } finally {
      setLoading(false)
    }
  }, [orderNumber])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!cancelled) await load()
    })()

    return () => {
      cancelled = true
    }
  }, [load])

  if (loading) {
    return <p className="font-body text-[13px] text-pewter py-16 text-center">Loading your order…</p>
  }

  if (error || !tracking) {
    return (
      <div className="border border-obsidian/10 bg-ivory-200/50 px-8 py-10 text-center">
        <p className="font-body text-[13px] text-pewter-dark mb-5">{error}</p>
        <Link
          href="/account"
          className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border-b border-gold/50 pb-1"
        >
          Go to your account
        </Link>
      </div>
    )
  }

  const current = stageIndex(tracking.status)
  const isCancelled = ['cancelled', 'returned'].includes(tracking.status.toLowerCase())

  return (
    <div className="flex flex-col gap-12">
      {/* Summary */}
      <div className="border border-obsidian/10 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1">
              Order reference
            </p>
            <p className="font-display text-2xl text-obsidian tracking-wider">
              {tracking.orderReference}
            </p>
          </div>

          <div className="text-right">
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1">
              Status
            </p>
            <p className="font-display text-xl text-obsidian capitalize">
              {tracking.currentStatus}
            </p>
          </div>
        </div>

        {(tracking.courierName || tracking.awbCode || tracking.estimatedDelivery) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-obsidian/8">
            {tracking.courierName && (
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-pewter block mb-1">
                  Courier
                </span>
                <span className="font-body text-[13px] text-obsidian">{tracking.courierName}</span>
              </div>
            )}
            {tracking.awbCode && (
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-pewter block mb-1">
                  Tracking number
                </span>
                <span className="font-body text-[13px] text-obsidian">{tracking.awbCode}</span>
              </div>
            )}
            {tracking.estimatedDelivery && (
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-pewter block mb-1">
                  Estimated delivery
                </span>
                <span className="font-body text-[13px] text-obsidian">
                  {new Date(tracking.estimatedDelivery).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress */}
      {!isCancelled && (
        <ol className="flex flex-col gap-0">
          {STAGES.map((stage, i) => {
            const done = i <= current
            const isLast = i === STAGES.length - 1

            return (
              <li key={stage.key} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                      done ? 'bg-gold' : 'bg-obsidian/15'
                    }`}
                  />
                  {!isLast && (
                    <span
                      className={`w-[1px] flex-1 min-h-[52px] ${
                        i < current ? 'bg-gold/40' : 'bg-obsidian/10'
                      }`}
                    />
                  )}
                </div>

                <div className="pb-8">
                  <p
                    className={`font-display text-[18px] ${
                      done ? 'text-obsidian' : 'text-pewter/60'
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className="font-body text-[12.5px] text-pewter-dark mt-1">{stage.copy}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {isCancelled && (
        <div className="border border-obsidian/10 bg-ivory-200/50 px-8 py-8">
          <p className="font-display text-[20px] text-obsidian mb-2 capitalize">
            This order was {tracking.status}.
          </p>
          <p className="font-body text-[13px] text-pewter-dark">
            If that looks wrong, reply to your confirmation email and we&apos;ll sort it out.
          </p>
        </div>
      )}

      {/* Courier checkpoints, when the courier has reported any */}
      {tracking.checkpoints.length > 0 && (
        <div>
          <h2 className="font-display text-[20px] text-obsidian mb-5">Courier updates</h2>
          <ol className="flex flex-col divide-y divide-obsidian/8 border-y border-obsidian/8">
            {tracking.checkpoints.map((point, i) => (
              <li key={i} className="py-4 flex flex-wrap items-baseline justify-between gap-3">
                <span className="font-body text-[13px] text-obsidian">
                  {point.activity ?? point.status ?? 'Update'}
                </span>
                <span className="font-body text-[12px] text-pewter">
                  {[point.location, point.date].filter(Boolean).join(' · ')}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
