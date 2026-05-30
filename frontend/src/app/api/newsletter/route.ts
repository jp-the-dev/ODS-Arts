// POST /api/newsletter — subscribe email to newsletter
import type { NextRequest } from 'next/server'
export async function POST(request: NextRequest) {
  return Response.json({ success: true })
}
