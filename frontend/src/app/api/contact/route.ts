// POST /api/contact — contact form submission
import type { NextRequest } from 'next/server'
export async function POST(request: NextRequest) {
  return Response.json({ success: true })
}
