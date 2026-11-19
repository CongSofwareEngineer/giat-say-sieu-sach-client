import type { AgentContext, AgentStreamHandlers, AgentTool } from './base'

import { AGENT_REGISTRY } from './agents'

import { ORDER_CODE_IN_TEXT_REGEX } from '@/constants/app'
import { ANSWER_READY_TOOLS, CHAT_LOG_PHONE_REGEX, TOOL_NAME } from '@/constants/tools'
import { normalizeOrderCode } from '@/services/order'
import { isValidVnPhone, normalizeVnPhone } from '@/utils/phone'

// Fast path: skip the LLM entirely for the requests whose answer is already
// decided. Jev picks the tool, the tool builds the text from the API data
// through translate(), and that text is the reply. One Jev request per turn,
// no chat completion, and the wording is identical every time.
//
// A tool qualifies only when its output is a finished, user-facing answer
// (ANSWER_READY_TOOLS). Anything else — a result the model still has to read,
// combine or shorten — keeps going through runAgent.

// Jev picks from the global tool set (TOOL_NAME is unique across agents), so
// the pick may not belong to the agent it routed to: look the tool up in the
// whole registry rather than in one agent.
const findTool = (name: string): AgentTool | undefined => {
  for (const agent of Object.values(AGENT_REGISTRY)) {
    const tool = agent.tools.find((candidate) => candidate.name === name)

    if (tool) return tool
  }

  return undefined
}

const isAnswerReady = (name: string): boolean => (ANSWER_READY_TOOLS as string[]).includes(name)

// ---------------------------------------------------------------------------
// Tool arguments. Jev decides *which* tool runs but returns no parameters, so
// the few tools that need one read it from the message with a regex. That is
// both cheaper and more accurate than asking an LLM to copy a code out of a
// sentence; a value it cannot find is simply left out.
// ---------------------------------------------------------------------------

// First order code in the message ("#K7QH3MZP", "k7qh3mzp"). Without the "#" the
// candidate must contain a digit, otherwise an 8-letter word ("abcdefgh") would
// be read as an order code.
const extractOrderCode = (message: string): string | undefined => {
  const match = ORDER_CODE_IN_TEXT_REGEX.exec(message)

  if (!match) return undefined

  const [, hash, candidate] = match

  if (!hash && !/[2-9]/.test(candidate)) return undefined

  return normalizeOrderCode(candidate)
}

// First valid Vietnamese phone number in the message, in local 0xx form
const extractPhone = (message: string): string | undefined => {
  const found = (message.match(CHAT_LOG_PHONE_REGEX) ?? []).find((candidate) => isValidVnPhone(candidate))

  return found ? normalizeVnPhone(found) : undefined
}

// Arguments per tool. Returning null means "cannot answer without the LLM":
// track_order has nothing to look up without a code, so the agent asks for it
// in context instead of the tool answering with a canned request.
const TOOL_ARGS: Record<string, (message: string) => Record<string, unknown> | null> = {
  [TOOL_NAME.trackOrder]: (message) => {
    const orderCode = extractOrderCode(message)

    return orderCode ? { orderCode } : null
  },
  // Logged-in users are read from ctx; a guest's phone may be in the message,
  // and without one the tool asks for it and opens the phone form
  [TOOL_NAME.getMyOrders]: (message) => {
    const phone = extractPhone(message)

    return phone ? { phone } : {}
  },
  // No code: the tool lists the orders still waiting for confirmation
  [TOOL_NAME.cancelMyOrder]: (message) => {
    const orderCode = extractOrderCode(message)

    return orderCode ? { orderCode } : {}
  },
}

const buildArgs = (toolName: string, message: string): Record<string, unknown> | null => (TOOL_ARGS[toolName] ?? (() => ({})))(message)

// Run the tool Jev was confident about and return its text as the final answer.
// Returns null whenever this turn is not eligible, which means the caller must
// run the agent as usual: unknown tool, tool that needs interpreting, a tool
// that answered with nothing, or a failure (the agent then reports the error
// to the user in its own words).
export const runFastPath = async (
  toolName: string,
  message: string,
  ctx: AgentContext,
  handlers: AgentStreamHandlers = {}
): Promise<string | null> => {
  if (!isAnswerReady(toolName)) return null

  const tool = findTool(toolName)

  if (!tool) return null

  const args = buildArgs(toolName, message)

  if (!args) return null

  handlers.signal?.throwIfAborted()

  // Same status label the tool loop shows, so the UI is unchanged
  handlers.onToolCall?.(tool.name)

  try {
    const output = await tool.execute(args, ctx)

    handlers.signal?.throwIfAborted()

    return output.trim() || null
  } catch (error) {
    // The user aborted: let the caller propagate it instead of answering
    if (handlers.signal?.aborted) throw error

    return null
  }
}
