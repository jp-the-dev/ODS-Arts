'use client'

import { apiFetch } from '@/lib/api/client'

interface InitPaymentResponse {
  razorpay_order_id: string
  razorpay_key_id: string
  amount: number
  currency: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  modal: {
    ondismiss: () => void
  }
}

let scriptLoaded = false
let scriptLoading: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve()
  if (scriptLoading) return scriptLoading

  scriptLoading = new Promise<void>((resolve, reject) => {
    if (typeof (window as any).Razorpay !== 'undefined') {
      scriptLoaded = true
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      scriptLoaded = true
      resolve()
    }
    script.onerror = () => {
      scriptLoading = null
      reject(new Error('Failed to load Razorpay checkout script'))
    }
    document.body.appendChild(script)
  })

  return scriptLoading
}

export async function initiatePayment(
  orderNumber: string,
  customer: { fullName: string; email: string; phone: string },
): Promise<void> {
  const payment = await apiFetch<InitPaymentResponse>(
    `/auth/orders/${orderNumber}/pay`,
    { method: 'POST' },
  )

  await loadScript()

  return new Promise<void>((resolve, reject) => {
    const options: RazorpayOptions = {
      key: payment.razorpay_key_id,
      amount: payment.amount,
      currency: payment.currency,
      name: 'ODS Arts',
      description: `Order ${orderNumber}`,
      order_id: payment.razorpay_order_id,
      prefill: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phone,
      },
      handler: async (response) => {
        try {
          await apiFetch(`/auth/orders/${orderNumber}/verify`, {
            method: 'POST',
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          resolve()
        } catch {
          reject(new Error('Payment verification failed'))
        }
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled'))
        },
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  })
}
