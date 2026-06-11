'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { apiFetch } from '@/lib/api/client'
import type { TrackingResponse, TrackingEvent } from '@/lib/types/shipping'

// ── Status → human label ──────────────────────────────────────────────────────

const statusLabel: Record<string, string> = {
  'NEW':               'Order Created',
  'PICKUP SCHEDULED':  'Pickup Scheduled',
  'PICKUP GENERATED':  'Pickup Generated',
  'PICKED UP':         'Picked Up',
  'IN TRANSIT':        'In Transit',
  'OUT FOR DELIVERY':  'Out for Delivery',
  'DELIVERED':         'Delivered',
  'CANCELLED':         'Cancelled',
  'RTO INITIATED':     'Return Initiated',
  'RTO DELIVERED':     'Returned',
}

function humanStatus(s: string): string {
  return statusLabel[s?.toUpperCase()] ?? s ?? 'Processing'
}

// ── Timeline Dot ──────────────────────────────────────────────────────────────

function TimelineDot({ done }: { done: boolean }) {
  return (
    <div className="relative flex-shrink-0 flex flex-col items-center">
      <div
        className={`w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300 ${
          done
            ? 'bg-[#C9A96E] border-[#C9A96E]'
            : 'bg-transparent border-white/20'
        }`}
      />
    </div>
  )
}

// ── Shimmer skeleton ──────────────────────────────────────────────────────────

function Shimmer() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10 flex-shrink-0 mt-1" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 w-40 bg-white/10 rounded" />
            <div className="h-2.5 w-24 bg-white/8 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Drawer ───────────────────────────────────────────────────────────────

interface TrackingDrawerProps {
  orderNumber: string | null
  onClose: () => void
}

export default function TrackingDrawer({ orderNumber, onClose }: TrackingDrawerProps) {
  const [tracking, setTracking]   = useState<TrackingResponse | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const fetchTracking = useCallback(async (ref: string) => {
    setLoading(true)
    setError(null)
    setTracking(null)
    try {
      const data = await apiFetch<TrackingResponse>(`/auth/orders/${ref}/tracking`)
      setTracking(data)
    } catch {
      setError('Unable to load tracking information. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (orderNumber) fetchTracking(orderNumber)
  }, [orderNumber, fetchTracking])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isDelivered = tracking?.current_status?.toUpperCase() === 'DELIVERED'

  return (
    <AnimatePresence>
      {orderNumber && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-obsidian/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-[#161614] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 pt-8 pb-5 border-b border-white/8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-[#C9A96E] mb-1">
                    Shipment Tracking
                  </p>
                  <h2 className="font-display text-white text-xl leading-tight">
                    {orderNumber}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close tracking"
                  className="mt-1 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loading ? (
                <Shimmer />
              ) : error ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white/20">
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 10v8M16 21v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p className="font-body text-[13px] text-white/40">{error}</p>
                  <button
                    onClick={() => orderNumber && fetchTracking(orderNumber)}
                    className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C9A96E] hover:text-white transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              ) : tracking ? (
                <div className="flex flex-col gap-6">

                  {/* Status pill + courier */}
                  <div className="flex flex-col gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${
                      isDelivered
                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                        : 'bg-[#C9A96E]/10 border border-[#C9A96E]/25'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isDelivered ? 'bg-emerald-400' : 'bg-[#C9A96E] animate-pulse'}`} />
                      <span className={`font-body text-[11px] uppercase tracking-[0.15em] ${isDelivered ? 'text-emerald-400' : 'text-[#C9A96E]'}`}>
                        {humanStatus(tracking.current_status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {tracking.courier_name && (
                        <div className="bg-white/[0.04] border border-white/8 px-4 py-3">
                          <p className="font-body text-[9px] uppercase tracking-[0.25em] text-white/35 mb-1">Courier</p>
                          <p className="font-body text-[13px] text-white/80">{tracking.courier_name}</p>
                        </div>
                      )}
                      {tracking.awb_code && (
                        <div className="bg-white/[0.04] border border-white/8 px-4 py-3">
                          <p className="font-body text-[9px] uppercase tracking-[0.25em] text-white/35 mb-1">AWB</p>
                          <p className="font-body text-[13px] text-white/80 truncate">{tracking.awb_code}</p>
                        </div>
                      )}
                      {(tracking.etd ?? tracking.estimated_delivery_date) && (
                        <div className="bg-white/[0.04] border border-white/8 px-4 py-3 col-span-2">
                          <p className="font-body text-[9px] uppercase tracking-[0.25em] text-white/35 mb-1">
                            Estimated Delivery
                          </p>
                          <p className="font-body text-[13px] text-[#C9A96E]">
                            {tracking.etd ?? tracking.estimated_delivery_date}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* No AWB yet */}
                  {!tracking.awb_code && tracking.message && (
                    <p className="font-body text-[13px] text-white/40 leading-relaxed border border-white/8 px-4 py-4">
                      {tracking.message}
                    </p>
                  )}

                  {/* Timeline */}
                  {tracking.tracking_events.length > 0 && (
                    <div>
                      <p className="font-body text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">
                        Timeline
                      </p>
                      <div className="relative flex flex-col gap-0">
                        {/* Vertical line */}
                        <div className="absolute left-[4px] top-2 bottom-2 w-px bg-white/8" />

                        {tracking.tracking_events.map((event: TrackingEvent, i) => {
                          const isDone = i < tracking.tracking_events.length - 1 ||
                            isDelivered
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05, duration: 0.3 }}
                              className="flex gap-4 items-start pb-6 last:pb-0"
                            >
                              <TimelineDot done={isDone} />
                              <div className="flex flex-col gap-0.5">
                                <p className={`font-body text-[13px] leading-snug ${isDone ? 'text-white/80' : 'text-white/35'}`}>
                                  {event.activity}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  {event.date && (
                                    <span className="font-body text-[11px] text-white/30">{event.date}</span>
                                  )}
                                  {event.location && (
                                    <span className="font-body text-[11px] text-white/25">· {event.location}</span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-white/8">
              <p className="font-body text-[11px] text-white/25 text-center">
                Tracking updates are provided by Shiprocket. Contact us at hello@odsarts.in
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
