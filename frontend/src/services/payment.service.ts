/**
 * ODSArts — Payment Service (Razorpay)
 *
 * Flow, after an order already exists server-side:
 *   1. startPayment()   → POST /orders/:ref/pay    → Razorpay order id + public key
 *   2. openRazorpay()   → the hosted checkout widget
 *   3. verifyPayment()  → POST /orders/:ref/verify → server checks the signature
 *
 * The order is created *before* payment, so an abandoned or failed payment
 * leaves a recoverable `pending` order rather than losing the sale entirely.
 * The webhook confirms payment independently if the browser closes mid-flow.
 */

import { apiFetch, ApiError } from '@/lib/api/client'
import { authHeaders } from '@/lib/store/auth'

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

export interface StartPaymentResponse {
  razorpayOrderId: string
  razorpayKey: string
  amountPaise: number
  currency: string
  orderReference: string
}

export interface RazorpaySuccess {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export type PaymentOutcome =
  /** Signature verified server-side — money taken. */
  | { status: 'paid' }
  /** Payments are not configured on the server (missing keys). */
  | { status: 'unavailable' }
  /** Customer closed the widget without paying. Order stands, unpaid. */
  | { status: 'pending'; reason: string }
  /**
   * The payment was attempted and refused — a declined card, a failed UPI
   * collect. Distinct from `pending` because the customer must be told their
   * money was not taken rather than shown a confirmation.
   */
  | { status: 'failed'; reason: string }

// ── Razorpay global ───────────────────────────────────────────────────────────

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  handler: (response: RazorpaySuccess) => void
  modal: { ondismiss: () => void }
}

interface RazorpayInstance {
  open: () => void
  on: (event: string, handler: (response: unknown) => void) => void
  close: () => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

/** Inject the Razorpay script once; resolves false if it cannot be loaded. */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT}"]`
    )

    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)))
      existing.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT
    script.async = true
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** Ask the server to open a Razorpay order. Null means payments are unconfigured. */
export async function startPayment(
  orderReference: string
): Promise<StartPaymentResponse | null> {
  try {
    return await apiFetch<StartPaymentResponse>(
      `/orders/${encodeURIComponent(orderReference)}/pay`,
      { method: 'POST', revalidate: false, headers: authHeaders() }
    )
  } catch (error) {
    // 503 = RAZORPAY_KEY/SECRET not set. Treat as "cannot collect payment now"
    // rather than an error — the order is already placed and recoverable.
    if (error instanceof ApiError && error.status === 503) return null
    throw error
  }
}

export async function verifyPayment(
  orderReference: string,
  response: RazorpaySuccess
): Promise<void> {
  await apiFetch(`/orders/${encodeURIComponent(orderReference)}/verify`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
    }),
    revalidate: false,
  })
}

/**
 * Tell the server the browser saw the payment fail.
 *
 * Razorpay reports a decline to the browser only, so without this the order is
 * indistinguishable from one the customer abandoned. Never throws: the report
 * is best-effort, and failing to record it must not turn a declined payment
 * into an error screen on top of everything else.
 */
export async function reportPaymentFailed(
  orderReference: string,
  razorpayOrderId: string,
  reason?: string
): Promise<void> {
  try {
    await apiFetch(`/orders/${encodeURIComponent(orderReference)}/payment-failed`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ razorpay_order_id: razorpayOrderId, reason }),
      revalidate: false,
    })
  } catch {
    // The webhook is the backstop — Razorpay also reports payment.failed to us.
  }
}

// ── Orchestration ─────────────────────────────────────────────────────────────

/**
 * Run the whole payment attempt and resolve with the outcome.
 *
 * Never throws for an abandoned or declined payment — those resolve as
 * `pending`, because the order itself is already safely recorded.
 */
export async function payForOrder(
  orderReference: string,
  customer?: { fullName: string; email: string; phone: string }
): Promise<PaymentOutcome> {
  let session: StartPaymentResponse | null

  try {
    session = await startPayment(orderReference)
  } catch {
    return { status: 'pending', reason: 'We could not start the payment.' }
  }

  if (!session) return { status: 'unavailable' }

  const ready = await loadRazorpayScript()

  if (!ready || !window.Razorpay) {
    return { status: 'pending', reason: 'The payment window could not be loaded.' }
  }

  return new Promise<PaymentOutcome>((resolve) => {
    const razorpay = new window.Razorpay!({
      key: session.razorpayKey,
      amount: session.amountPaise,
      currency: session.currency,
      order_id: session.razorpayOrderId,
      name: 'ODSArts',
      description: `Order ${orderReference}`,
      // Prefill is a convenience, not a requirement — retrying from the order
      // page has no form to read from, and Razorpay simply asks for the details.
      prefill: {
        name: customer?.fullName ?? '',
        email: customer?.email ?? '',
        contact: customer?.phone ?? '',
      },
      theme: { color: '#C9A96E' },
      handler: (response) => {
        verifyPayment(orderReference, response)
          .then(() => resolve({ status: 'paid' }))
          .catch(() =>
            resolve({
              status: 'pending',
              // The webhook is the safety net here: if the payment really was
              // captured, the server confirms it regardless of this failure.
              reason: 'We are confirming your payment. You will get an email shortly.',
            })
          )
      },
      modal: {
        ondismiss: () =>
          resolve({ status: 'pending', reason: 'Payment was not completed.' }),
      },
    })

    razorpay.on('payment.failed', (event) => {
      const reason =
        (event as { error?: { description?: string } })?.error?.description ??
        'The payment did not go through.'

      // Resolve before closing. close() fires modal.ondismiss, which resolves
      // with 'pending' — harmless once settled, but it would win the race if we
      // waited for the report first, and a declined card would be reported to
      // the customer as an abandoned one.
      resolve({ status: 'failed', reason })

      // Razorpay leaves its window open on a failed payment, so the customer is
      // left staring at a dead form with no obvious way out until they find the
      // close button themselves.
      void reportPaymentFailed(orderReference, session.razorpayOrderId, reason)

      try {
        razorpay.close()
      } catch {
        // Older widget builds have no close(); the customer can still dismiss it.
      }
    })

    razorpay.open()
  })
}
