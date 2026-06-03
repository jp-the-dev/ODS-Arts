// POST /api/newsletter — subscribe email to newsletter
// Forwards to Laravel API: POST /api/v1/newsletter/subscribe
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: body.email }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({ success: true, message: data.message })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to subscribe.' }, { status: 500 })
  }
}

