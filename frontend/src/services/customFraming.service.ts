/**
 * ODSArts — Custom Framing Quote Service
 *
 * Follows the same mock-aware pattern as orders.service.ts.
 *
 * MOCK (default): simulates a 1.2s delay, returns a generated CFR-XXXXXX reference.
 * REAL: set NEXT_PUBLIC_USE_MOCK_DATA=false → POSTs to POST /custom-framing/quotes
 */

import { apiFetch } from '@/lib/api/client'
import type { CustomFramingQuoteRequest, CustomFramingQuoteResponse } from '@/lib/types/customFraming'

// `POST /custom-framing/quotes` is not implemented on the Laravel side yet, so
// quote requests stay mocked even when NEXT_PUBLIC_USE_MOCK_DATA=false takes the
// rest of the app live. Flip NEXT_PUBLIC_FRAMING_API_READY=true once it ships.
const USE_MOCK = process.env.NEXT_PUBLIC_FRAMING_API_READY !== 'true'

function generateQuoteRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'CFR-'
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

export async function placeQuoteRequest(
  request: CustomFramingQuoteRequest
): Promise<CustomFramingQuoteResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200))
    return {
      quoteReference: generateQuoteRef(),
      receivedAt: new Date().toISOString(),
      estimatedResponseHours: 48,
    }
  }

  // Real API — activates when NEXT_PUBLIC_USE_MOCK_DATA=false
  return apiFetch<CustomFramingQuoteResponse>('/custom-framing/quotes', {
    method: 'POST',
    body: JSON.stringify(request),
    revalidate: false,
  })
}
