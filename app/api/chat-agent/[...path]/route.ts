import type { NextRequest } from 'next/server'

import { IS_PRODUCTION } from '@/constants/app'

// Hardcoded allowlist of domains allowed to call this endpoint
const ALLOWED_ORIGINS = ['https://giatsaysieusach.vercel.app', 'http://localhost:3000', 'http://localhost:3001'] as const

// Dev tunnel domain suffix used with cloudflared (matches next.config allowedDevOrigins)
const TUNNEL_DOMAIN_SUFFIX = '.trycloudflare.com'

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false

  if ((ALLOWED_ORIGINS as readonly string[]).includes(origin)) return true

  try {
    return new URL(origin).hostname.endsWith(TUNNEL_DOMAIN_SUFFIX)
  } catch {
    return false
  }
}

export const runtime = 'nodejs'

// Pass-through proxy. The client calls /api/chat-agent/<path> and the request
// body is forwarded verbatim to <AGENT_API_URL>/<path> with the API key as a
// Bearer token. Sole purpose: keep the key off the client — the proxy never
// reads or transforms the body or the response.
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const origin = request.headers.get('origin')

  if (!isAllowedOrigin(origin) && IS_PRODUCTION) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { path } = await params

  const apiUrl = process.env.AGENT_API_URL || 'https://api.tokenrouter.com/v1'
  const apiKey = process.env.AGENT_API_KEY
  const body = await request.text()

  const target = `${apiUrl}/${path.join('/')}`

  const response = await fetch(target, {
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
