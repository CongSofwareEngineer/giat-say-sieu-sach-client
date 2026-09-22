import type { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = ['https://giatuisieusach.vercel.app', 'http://localhost:3000', 'http://localhost:3001'] as const

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false

  return (ALLOWED_ORIGINS as readonly string[]).includes(origin)
}

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 1024 * 1024

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!isAllowedOrigin(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const apiUrl = process.env.SYSTEM_ONE_API_URL
  const apiKey = process.env.SYSTEM_ONE_API_KEY
  const body = await request.text()

  if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413 })
  }

  const url = apiUrl + '/' + 'systemone'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body,
  })

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}
