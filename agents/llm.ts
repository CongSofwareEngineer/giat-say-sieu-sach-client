import type { AgentMessage, AgentStreamHandlers, AgentToolCall, ToolDefinition } from './base'

import { CHAT_COMPLETIONS_PATH, SSE_CONTENT_TYPE, SSE_DATA_PREFIX, SSE_DONE_EVENT } from '@/constants/tools'

// Model the client asks for, forwarded verbatim by the proxy. Override via
// NEXT_PUBLIC_AGENT_MODEL or change the default here.
const AGENT_MODEL = process.env.NEXT_PUBLIC_AGENT_MODEL || 'moonshotai/kimi-k3-free'

export interface LlmRequest {
  system?: string
  messages: AgentMessage[]
  tools?: ToolDefinition[]
}

export interface LlmResponse {
  text: string | null
  toolCalls: AgentToolCall[]
}

// Text content as a part array, matching the tokenrouter chat completions API
const textParts = (text: string) => [{ type: 'text', text }]

// Build the OpenAI-compatible message array the provider expects
const buildOpenAiMessages = (system: string | undefined, messages: AgentMessage[]): Record<string, unknown>[] => {
  const result: Record<string, unknown>[] = []

  if (system) result.push({ role: 'system', content: system })

  messages.forEach((m) => {
    if (m.role === 'tool') {
      result.push({ role: 'tool', tool_call_id: m.toolCallId, content: m.content ?? '' })

      return
    }

    // Assistant content must be a plain string; an empty text-part array is
    // rejected by the provider (vLLM) with "Assistant messages must contain
    // text, reasoning content, or tool_calls".
    if (m.role === 'assistant') {
      result.push({
        role: 'assistant',
        content: m.content ?? '',
        ...(m.toolCalls?.length
          ? {
              tool_calls: m.toolCalls.map((call) => ({
                id: call.id,
                type: 'function',
                function: { name: call.name, arguments: JSON.stringify(call.arguments ?? {}) },
              })),
            }
          : {}),
      })

      return
    }

    result.push({ role: m.role, content: textParts(m.content ?? '') })
  })

  return result
}

// Map our tool definitions to OpenAI function tools
const buildOpenAiTools = (tools: ToolDefinition[]) =>
  tools.map((tool) => ({
    type: 'function',
    function: { name: tool.name, description: tool.description, parameters: tool.parameters },
  }))

const safeParse = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') return value as Record<string, unknown>

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>
    } catch {
      return {}
    }
  }

  return {}
}

// Text from a message content: plain string or part array
const extractText = (rawContent: unknown): string | null => {
  if (typeof rawContent === 'string') return rawContent

  if (Array.isArray(rawContent)) {
    return (
      rawContent
        .filter((part: any) => part && typeof part.text === 'string')
        .map((part: any) => part.text)
        .join('') || null
    )
  }

  return null
}

const parseToolCall = (call: any): AgentToolCall => ({
  id: String(call?.id ?? ''),
  name: String(call?.function?.name ?? ''),
  arguments: safeParse(call?.function?.arguments),
})

// Build the complete request and post it to the pass-through proxy (which only adds the API key)
const postCompletion = (request: LlmRequest, isStream: boolean, signal?: AbortSignal) =>
  fetch(CHAT_COMPLETIONS_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      model: AGENT_MODEL,
      messages: buildOpenAiMessages(request.system, request.messages),
      ...(request.tools && request.tools.length > 0 ? { tools: buildOpenAiTools(request.tools) } : {}),
      temperature: 0.4,
      ...(isStream ? { stream: true } : {}),
    }),
  })

// Parse a raw (non-streamed) chat.completions response
const readCompletion = async (response: Response): Promise<LlmResponse> => {
  const data = await response.json().catch(() => null)

  if (!response.ok || !data) {
    throw new Error(data?.error?.message || `Agent request failed (${response.status})`)
  }

  const message = (data as { choices?: { message?: { content?: unknown; tool_calls?: unknown[] } }[] })?.choices?.[0]?.message ?? {}

  return {
    text: extractText(message.content),
    toolCalls: (message.tool_calls ?? []).map(parseToolCall).filter((call) => call.name),
  }
}

// Non-streaming LLM call (router): returns once the whole response is ready
export const callLlm = async (request: LlmRequest, signal?: AbortSignal): Promise<LlmResponse> =>
  readCompletion(await postCompletion(request, false, signal))

// Streaming LLM call: emits text deltas and returns the assembled response.
// Falls back to a plain JSON read if the provider does not answer with SSE.
export const streamLlm = async (
  request: LlmRequest,
  { onText, signal }: Pick<AgentStreamHandlers, 'onText' | 'signal'> = {}
): Promise<LlmResponse> => {
  const response = await postCompletion(request, true, signal)
  const isEventStream = response.headers.get('Content-Type')?.includes(SSE_CONTENT_TYPE)

  if (!response.ok || !response.body || !isEventStream) {
    const result = await readCompletion(response)

    if (result.text && result.toolCalls.length === 0) onText?.(result.text)

    return result
  }

  let text = ''
  // Tool calls arrive in fragments, keyed by index (id / position as fallback)
  const pendingCalls = new Map<string | number, { id: string; name: string; args: string }>()

  // Handle one SSE line; returns true on the end-of-stream event
  const handleLine = (line: string): boolean => {
    const trimmed = line.trim()

    if (!trimmed.startsWith(SSE_DATA_PREFIX)) return false

    const payload = trimmed.slice(SSE_DATA_PREFIX.length).trim()

    if (payload === SSE_DONE_EVENT) return true

    let chunk: any

    try {
      chunk = JSON.parse(payload)
    } catch {
      return false
    }

    if (chunk?.error) throw new Error(chunk.error?.message || 'Agent stream failed')

    const delta = chunk?.choices?.[0]?.delta

    const deltaText = extractText(delta?.content)

    if (deltaText) {
      text += deltaText
      onText?.(deltaText)
    }

    ;(delta?.tool_calls ?? []).forEach((call: any, position: number) => {
      const key = call?.index ?? call?.id ?? position
      const pending = pendingCalls.get(key) ?? { id: '', name: '', args: '' }
      const args = call?.function?.arguments

      pendingCalls.set(key, {
        id: pending.id || String(call?.id ?? ''),
        name: pending.name || String(call?.function?.name ?? ''),
        args: pending.args + (typeof args === 'string' ? args : args ? JSON.stringify(args) : ''),
      })
    })

    return false
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let isDone = false

  while (!isDone) {
    const { done, value } = await reader.read()

    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Keep the last, possibly incomplete, line for the next read
    const lines = buffer.split('\n')

    buffer = lines.pop() ?? ''
    isDone = lines.some(handleLine)
  }

  if (isDone) await reader.cancel().catch(() => undefined)
  else handleLine(buffer + decoder.decode())

  return {
    text: text || null,
    toolCalls: [...pendingCalls.values()]
      .map((call) => ({ id: call.id, name: call.name, arguments: safeParse(call.args) }))
      .filter((call) => call.name),
  }
}
