/**
 * ODSArts — Custom Framing Quote Service
 *
 * MOCK (default): simulates a 1.2s delay, returns a generated CFR-XXXXXX reference.
 * REAL (NEXT_PUBLIC_USE_MOCK_DATA=false): POSTs to POST /enquiries with type:'custom_framing'
 *   and a metadata JSON field containing the structured framing config.
 *
 * The backend EnquiryController returns { data: { id, reference }, message }.
 * We use `reference` (CFR-000001 format) as the quote reference on the success screen.
 */

import { apiFetch } from '@/lib/api/client'
import type { CustomFramingQuoteRequest, CustomFramingQuoteResponse } from '@/types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'

function generateQuoteRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'CFR-'
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

interface EnquiryResponse {
  data: { id: number; reference: string }
  message: string
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

  // Build a human-readable summary for the `message` field
  const sizeStr = request.size.preset
    ? `${request.size.preset.replace('x', ' × ')} inches`
    : `${request.size.widthCm} × ${request.size.heightCm} ${request.size.unit}`

  const frameSummary = [
    request.frame.material,
    request.frame.finish,
    request.frame.profile,
  ]
    .filter(Boolean)
    .join(' / ')

  const matSummary =
    request.mat.style === 'none'
      ? 'No mat'
      : `${request.mat.style} mat, ${request.mat.colourLabel}, ${request.mat.width}`

  const message = [
    `Custom Framing Request`,
    `Size: ${sizeStr}`,
    `Frame: ${frameSummary}`,
    `Mat: ${matSummary}`,
    `Estimated price: ₹${(request.estimatedPriceFromPaise / 100).toLocaleString('en-IN')}`,
    request.contact.notes ? `Notes: ${request.contact.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  // Real API — POST /enquiries with type:custom_framing
  const res = await apiFetch<EnquiryResponse>('/enquiries', {
    method: 'POST',
    body: JSON.stringify({
      name: request.contact.fullName,
      email: request.contact.email,
      phone: request.contact.phone,
      message,
      type: 'custom_framing',
      metadata: {
        artwork_provided: request.artworkProvided,
        artwork_filename: request.artworkFilename,
        size: request.size,
        mat: request.mat,
        frame: request.frame,
        estimated_price_paise: request.estimatedPriceFromPaise,
      },
    }),
    revalidate: false,
  })

  return {
    quoteReference: res.data.reference ?? `CFR-${String(res.data.id).padStart(6, '0')}`,
    receivedAt: new Date().toISOString(),
    estimatedResponseHours: 48,
  }
}
