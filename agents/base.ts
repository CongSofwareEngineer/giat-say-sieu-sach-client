// Shared agent types used by the client-side orchestrator, the tool registry
// and the chat proxy route. Kept free of server-only imports so it runs in
// the browser as well (the tool loop is executed on the client).

export type AgentRole = 'system' | 'user' | 'assistant' | 'tool'

export interface AgentToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

// One turn of the conversation as sent to the LLM (and stored as chat history)
export interface AgentMessage {
  role: AgentRole
  content?: string | null
  // Present on 'tool' turns to match the assistant's tool call
  toolCallId?: string
  // Tool name, used on 'tool' turns to build the Gemini functionResponse part
  name?: string
  // Present on 'assistant' turns that requested tool calls
  toolCalls?: AgentToolCall[]
}

// Context passed to every tool execution
export interface AgentContext {
  locale: string
  userId?: string
}

// JSON-schema-ish description of a tool's arguments
export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
  enum?: string[]
  properties?: Record<string, ToolParameter>
  required?: string[]
  items?: ToolParameter
}

export interface ToolDefinition {
  name: string
  description: string
  parameters?: ToolParameter
}

// A registered tool: metadata sent to the LLM + the client-side executor
export interface AgentTool extends ToolDefinition {
  execute: (args: Record<string, unknown>, ctx: AgentContext) => Promise<string>
}

// A specialized agent: system prompt + the subset of tools it may call
export interface AgentDefinition {
  name: string
  description: string
  systemPrompt: string | ((ctx: AgentContext) => string)
  tools: AgentTool[]
}

export interface ChatResult {
  text: string
  history: AgentMessage[]
}

// Strip stored history down to plain user/assistant turns (drop tool turns
// and assistant messages that only carried tool calls), keep the most recent
// MAX_HISTORY_MESSAGES, then append the new user message. Keeps the router
// prompt clean, tool-free and within a bounded context window.
const MAX_HISTORY_MESSAGES = 10

export const toConversation = (history: AgentMessage[], message: string): AgentMessage[] => {
  const clean = history.filter(
    (m) => m.role === 'user' || (m.role === 'assistant' && typeof m.content === 'string' && m.content.length > 0 && !m.toolCalls?.length)
  )

  return [...clean.slice(-MAX_HISTORY_MESSAGES), { role: 'user', content: message }]
}
