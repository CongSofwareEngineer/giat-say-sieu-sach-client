import { BaseTools, buildLanguageSystemPrompt } from './tools'

export type OpenAIToolCall = {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// Extra per-request options passed from the client (e.g. selected language)
export type AgentChatOptions = {
  locale?: string
}

// OpenAI-compatible chat message (chat/completions format)
export type AgentMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: OpenAIToolCall[]
  tool_call_id?: string
}

export type AgentConfig = {
  key: string
  description: string
  systemInstruction: string
  tools?: BaseTools
  model?: string
  apiKey?: string
  apiUrl?: string
  maxToolCalls?: number
}

export const DEFAULT_API_URL = 'https://api.tokenrouter.com/v1'
export const DEFAULT_MODEL = 'moonshotai/kimi-k3-free'

// Base agent: runs the chat-completions tool loop (tool_calls -> execute -> tool response)
// until the model produces a final text answer
export class AgentBase {
  readonly key: string
  readonly description: string
  protected tools: BaseTools
  protected systemInstruction: string
  protected model: string
  protected apiKey: string
  protected apiUrl: string
  protected maxToolCalls: number

  constructor(config: AgentConfig) {
    this.key = config.key
    this.description = config.description
    this.tools = config.tools ?? new BaseTools()
    this.systemInstruction = config.systemInstruction
    this.apiUrl = config.apiUrl ?? process.env.AGENT_API_URL ?? DEFAULT_API_URL
    this.model = config.model ?? process.env.AGENT_MODEL ?? DEFAULT_MODEL
    this.apiKey = config.apiKey ?? process.env.AGENT_API_KEY ?? ''
    this.maxToolCalls = config.maxToolCalls ?? 5
  }

  // Run a full chat turn with the tool loop and return the final text plus updated history
  async chat(input: string, history: AgentMessage[] = [], options: AgentChatOptions = {}): Promise<{ text: string; history: AgentMessage[] }> {
    const languagePrompt = buildLanguageSystemPrompt(options.locale)
    const system = languagePrompt ? `${this.systemInstruction}\n${languagePrompt}` : this.systemInstruction
    const messages: AgentMessage[] = [{ role: 'system', content: system }, ...history, { role: 'user', content: input }]

    for (let i = 0; i < this.maxToolCalls; i++) {
      const assistant = await this.generate({
        model: this.model,
        messages,
        tools: this.tools.tools(),
        tool_choice: 'auto',
      })

      messages.push(assistant)

      if (!assistant.tool_calls || assistant.tool_calls.length === 0) {
        return { text: assistant.content?.trim() ?? '', history: messages }
      }

      for (const call of assistant.tool_calls) {
        let args: Record<string, any> = {}

        try {
          args = JSON.parse(call.function.arguments || '{}')
        } catch {
          args = {}
        }

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(await this.tools.safeExecute(call.function.name, args, { locale: options.locale })),
        })
      }
    }

    throw new Error('Agent exceeded max tool call iterations')
  }

  // Send one chat/completions request and return the assistant message
  protected async generate(body: Record<string, unknown>): Promise<AgentMessage> {
    if (!this.apiKey) {
      throw new Error('AGENT_API_KEY is not configured')
    }

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()

      throw new Error(`Chat API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const message = data.choices?.[0]?.message as AgentMessage | undefined

    if (!message) {
      throw new Error('Chat API returned no message')
    }

    return message
  }
}
