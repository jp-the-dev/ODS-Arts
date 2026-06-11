/**
 * GET /api/shipping-rates?postcode=400001&weight=1200
 *
 * Next.js API proxy → Laravel GET /api/v1/shipping/rates
 * Avoids CORS issues when calling the backend from the browser.
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const postcode = searchParams.get('postcode') ?? ''
  const weight   = searchParams.get('weight') ?? '500'

  if (!postcode || !/^\d{6}$/.test(postcode)) {
    return NextResponse.json(
      { error: 'Invalid pincode — must be 6 digits' },
      { status: 400 }
    )
  }

  try {
    const url = `${BACKEND}/shipping/rates?delivery_postcode=${postcode}&weight=${weight}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 }, // cache rate for 60s per postcode
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { couriers: [], recommended: null, error: data.message ?? 'Rate fetch failed' },
        { status: 200 } // Always 200 to checkout doesn't break
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { couriers: [], recommended: null, error: 'Shipping service unavailable' },
      { status: 200 }
    )
  }
}
