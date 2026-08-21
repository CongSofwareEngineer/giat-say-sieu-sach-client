import type { AgentMessage, AgentToolCall, ToolDefinition } from './base'

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
      result.push({
        role: 'tool',
        tool_call_id: m.toolCallId,
        content: m.content ?? '',
      })

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
                function: {
                  name: call.name,
                  arguments: JSON.stringify(call.arguments ?? {}),
                },
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
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
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

// Client-side LLM client. Builds the complete request and posts it to the
// pass-through proxy (which only adds the API key), then parses the raw
// chat.completions response.
export const callLlm = async (request: LlmRequest): Promise<LlmResponse> => {
  const response = await fetch('/api/chat-agent/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AGENT_MODEL,
      messages: buildOpenAiMessages(request.system, request.messages),
      ...(request.tools && request.tools.length > 0 ? { tools: buildOpenAiTools(request.tools) } : {}),
      temperature: 0.4,
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || !data) {
    throw new Error(data?.error?.message || `Agent request failed (${response.status})`)
  }

  const choice = (
    data as {
      choices?: {
        message?: { content?: unknown; tool_calls?: unknown[] }
      }[]
    }
  )?.choices?.[0]

  const message = choice?.message ?? {}

  const rawContent = message.content

  // content can be a plain string or a part array
  let text: string | null = null

  if (typeof rawContent === 'string') {
    text = rawContent
  } else if (Array.isArray(rawContent)) {
    text =
      rawContent
        .filter((part: any) => part && typeof part.text === 'string')
        .map((part: any) => part.text)
        .join('') || null
  }

  const toolCalls: AgentToolCall[] = (message.tool_calls ?? [])
    .map((call: any) => ({
      id: String(call?.id ?? ''),
      name: String(call?.function?.name ?? ''),
      arguments: safeParse(call?.function?.arguments),
    }))
    .filter((call) => call.name)

  return { text, toolCalls }
}
