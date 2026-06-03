// POST /api/contact — contact form submission
// Forwards to Laravel API: POST /api/v1/enquiries
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/enquiries`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...body, type: 'contact' }),
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

