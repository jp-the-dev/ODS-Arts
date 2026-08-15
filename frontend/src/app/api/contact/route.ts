// POST /api/contact — contact form submission
// Forwards to Laravel API: POST /api/v1/enquiries
import { type NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(
      `${API_BASE_URL}/enquiries`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        // Callers may declare an enquiry type (contact | custom_framing |
        // gifting); Laravel validates it, so an unknown value is rejected there
        // rather than silently mislabelled here.
        body: JSON.stringify({ ...body, type: body.type ?? 'contact' }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({ success: true, message: data.message })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to send enquiry.' }, { status: 500 })
  }
}

