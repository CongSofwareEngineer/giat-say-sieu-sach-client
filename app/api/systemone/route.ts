import type { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = ['https://giatuisieusach.vercel.app', 'http://localhost:3000', 'http://localhost:3001'] as const

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false

  return (ALLOWED_ORIGINS as readonly string[]).includes(origin)
}

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 1024 * 1024 // 1MB
const UPSTREAM_PATH = 'systemone'
const CONTENT_TYPE_JSON = 'application/json'

// Browsers send OPTIONS before POST; only allowed origins get the preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!isAllowedOrigin(origin)) return new Response(null, { status: 403 })

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin as string,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!isAllowedOrigin(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Reject oversized payloads from the header first, before any body is buffered
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)

  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413 })
  }

  const apiUrl = process.env.SYSTEM_ONE_API_URL
  const apiKey = process.env.SYSTEM_ONE_API_KEY

  if (!apiUrl) {
    console.error('System One proxy error: SYSTEM_ONE_API_URL is not set')

    return Response.json({ error: 'Failed to proxy request' }, { status: 500 })
  }

  const body = await request.arrayBuffer()

  // Content-Length can be missing or lying, so re-check the real size
  if (body.byteLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413 })
  }

  try {
    const response = await fetch(`${apiUrl}/${UPSTREAM_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': CONTENT_TYPE_JSON,
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body,
    })

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || CONTENT_TYPE_JSON,
        'Access-Control-Allow-Origin': origin as string,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('System One proxy error:', err)

    return Response.json({ error: 'Failed to proxy request' }, { status: 500 })
  }
}
