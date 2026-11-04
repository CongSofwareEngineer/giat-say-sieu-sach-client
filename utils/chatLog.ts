import { SHOP_TIMEZONE } from '@/constants/app'
import {
  CHAT_LOG_COLUMNS,
  CHAT_LOG_MAX_TEXT_LENGTH,
  CHAT_LOG_PHONE_REGEX,
  CHAT_LOG_STATUS,
  SSE_CONTENT_TYPE,
  SSE_DATA_PREFIX,
  SSE_DONE_EVENT,
} from '@/constants/tools'

type ChatLogColumn = (typeof CHAT_LOG_COLUMNS)[number]
type StreamOutcome = 'finished' | 'cancelled' | 'failed'

interface ParsedCompletion {
  usage: any
  text: string
  toolCalls: string
  errorMessage: string
  isFinished: boolean
}

const EMPTY_COMPLETION: ParsedCompletion = {
  usage: null,
  text: '',
  toolCalls: '',
  errorMessage: '',
  isFinished: false,
}

interface CompletionResult {
  isHttpOk: boolean
  contentType: string
  raw: string
  outcome: StreamOutcome
}

// Mask every digit except the last 3, keeping separators
export const maskPhones = (text: string) => text.replace(CHAT_LOG_PHONE_REGEX, (phone) => phone.replace(/\d(?=(?:\D*\d){3})/g, '*'))

const toLogText = (text: string) => maskPhones(text).slice(0, CHAT_LOG_MAX_TEXT_LENGTH)

const contentToText = (content: unknown): string => {
  if (typeof content === 'string') return content

  if (Array.isArray(content)) return content.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('')

  return ''
}

// Latest user message of an OpenAI-compatible request body
const readQuestion = (rawBody: ArrayBuffer): string => {
  try {
    const body = JSON.parse(Buffer.from(rawBody).toString())
    const messages: any[] = Array.isArray(body?.messages) ? body.messages : []
    const lastUser = messages.findLast((message) => message?.role === 'user')

    return contentToText(lastUser?.content)
  } catch {
    return ''
  }
}

const formatToolCalls = (calls: { name: string; args: string }[]) => calls.map((call) => `${call.name}(${call.args})`).join('; ')

const parseStreamed = (raw: string): ParsedCompletion => {
  const parsed: ParsedCompletion = { ...EMPTY_COMPLETION }
  // Tool calls arrive in fragments, keyed by index
  const calls = new Map<string | number, { name: string; args: string }>()

  raw.split('\n').forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed.startsWith(SSE_DATA_PREFIX)) return

    const payload = trimmed.slice(SSE_DATA_PREFIX.length).trim()

    if (payload === SSE_DONE_EVENT) {
      parsed.isFinished = true

      return
    }

    let chunk: any

    try {
      chunk = JSON.parse(payload)
    } catch {
      return
    }

    if (chunk?.error) parsed.errorMessage = String(chunk.error?.message ?? chunk.error)

    parsed.usage = chunk?.usage ?? parsed.usage

    const choice = chunk?.choices?.[0]

    if (choice?.finish_reason) parsed.isFinished = true

    parsed.text += contentToText(choice?.delta?.content)
    ;(choice?.delta?.tool_calls ?? []).forEach((call: any, position: number) => {
      const key = call?.index ?? call?.id ?? position
      const pending = calls.get(key) ?? { name: '', args: '' }
      const args = call?.function?.arguments

      calls.set(key, {
        name: pending.name || String(call?.function?.name ?? ''),
        args: pending.args + (typeof args === 'string' ? args : args ? JSON.stringify(args) : ''),
      })
    })
  })

  parsed.toolCalls = formatToolCalls([...calls.values()])

  return parsed
}

const parseJson = (raw: string): ParsedCompletion => {
  try {
    const data = JSON.parse(raw)
    const choice = data?.choices?.[0]
    const calls = (choice?.message?.tool_calls ?? []).map((call: any) => ({
      name: String(call?.function?.name ?? ''),
      args: typeof call?.function?.arguments === 'string' ? call.function.arguments : JSON.stringify(call?.function?.arguments ?? {}),
    }))

    return {
      usage: data?.usage ?? null,
      text: contentToText(choice?.message?.content),
      toolCalls: formatToolCalls(calls),
      errorMessage: data?.error ? String(data.error?.message ?? data.error) : '',
      isFinished: true,
    }
  } catch {
    return { ...EMPTY_COMPLETION, errorMessage: raw }
  }
}

const resolveStatus = ({ isHttpOk, outcome }: CompletionResult, parsed: ParsedCompletion): CHAT_LOG_STATUS => {
  if (parsed.isFinished && isHttpOk && !parsed.errorMessage) return CHAT_LOG_STATUS.ok

  // The client stopping mid-reply is not a failure (raw JSON is unparsable then too)
  if (outcome === 'cancelled') return CHAT_LOG_STATUS.aborted

  return !isHttpOk || outcome === 'failed' || parsed.errorMessage ? CHAT_LOG_STATUS.error : CHAT_LOG_STATUS.ok
}

// Date as its own column: sheet pivots can group by it without parsing
const getLogTimestamps = () => {
  const stamp = new Date().toLocaleString('sv-SE', { timeZone: SHOP_TIMEZONE })

  return { date: stamp.slice(0, stamp.indexOf(' ')), time: stamp }
}

// Everything known before the provider answers
export const readChatLogRequest = (rawBody: ArrayBuffer) => ({ question: readQuestion(rawBody) })

export type ChatLogRequest = ReturnType<typeof readChatLogRequest>

// Build one sheet row, in CHAT_LOG_COLUMNS order
export const buildChatLogRow = (meta: ChatLogRequest, result: CompletionResult): (string | number)[] => {
  const parsed = result.contentType.includes(SSE_CONTENT_TYPE) ? parseStreamed(result.raw) : parseJson(result.raw)
  const status = resolveStatus(result, parsed)
  const usage = parsed.usage

  const entry: Record<ChatLogColumn, string | number> = {
    ...getLogTimestamps(),
    // Blank (not 0) when the provider reported nothing, so totals stay honest
    inputTokens: usage?.prompt_tokens ?? '',
    outputTokens: usage?.completion_tokens ?? '',
    cachedTokens: usage?.prompt_tokens_details?.cached_tokens ?? '',
    totalTokens: usage?.total_tokens ?? '',
    status,
    question: toLogText(meta.question),
    toolCalls: toLogText(parsed.toolCalls),
    answer: toLogText(status === CHAT_LOG_STATUS.error ? parsed.errorMessage : parsed.text),
  }

  return CHAT_LOG_COLUMNS.map((column) => entry[column])
}

// Row for a request that never got a response from the provider
export const buildChatLogFailureRow = (meta: ChatLogRequest, message: string) =>
  buildChatLogRow(meta, { isHttpOk: false, contentType: '', raw: JSON.stringify({ error: { message } }), outcome: 'failed' })

// Pass a response body through unchanged and report its full text when it ends.
// Cancelling still reaches the provider, so a stopped reply stops generating.
export const captureStream = (source: ReadableStream<Uint8Array>, onEnd: (raw: string, outcome: StreamOutcome) => void) => {
  const reader = source.getReader()
  const decoder = new TextDecoder()
  let raw = ''

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read()

        if (done) {
          onEnd(raw + decoder.decode(), 'finished')
          controller.close()

          return
        }

        raw += decoder.decode(value, { stream: true })
        controller.enqueue(value)
      } catch (error) {
        onEnd(raw, 'failed')
        controller.error(error)
      }
    },
    cancel(reason) {
      onEnd(raw, 'cancelled')

      return reader.cancel(reason)
    },
  })
}
