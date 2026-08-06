import type { NextRequest } from 'next/server'
import type { AgentMessage } from '@/agents/base'

import { chatAgent } from '@/agents'

// Hardcoded allowlist of domains allowed to call this endpoint
const ALLOWED_ORIGINS = ['https://giatsaysieusach.vercel.app', 'http://localhost:3001'] as const

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

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')

  // if (!isAllowedOrigin(origin)) {
  //   return Response.json({ error: 'Forbidden' }, { status: 403 })
  // }

  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : typeof body?.input === 'string' ? body.input.trim() : ''

    if (!message) {
      return Response.json({ error: 'Invalid message' }, { status: 400 })
    }

    const history = Array.isArray(body?.history) ? (body.history as AgentMessage[]).filter(isHistoryMessage) : []
    const result = await chatAgent.chat(message, history)

    return Response.json(result)
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Agent error' }, { status: 500 })
  }
}

// Keep only valid conversation turns from the client.
// The client only sends user/assistant/tool turns; the server owns the system prompt,
// so any system turn the client stored is dropped to avoid duplicates.
const isHistoryMessage = (message: AgentMessage): boolean =>
  message.role !== 'system' && ['user', 'assistant', 'tool'].includes(message.role) && typeof message.content === 'string'
