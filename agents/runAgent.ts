import type { AgentContext, AgentDefinition, AgentMessage, AgentStreamHandlers } from './base'

import { streamLlm } from './llm'

import { translate } from '@/utils/language'

// Safety cap so a chatty agent cannot loop forever
const MAX_TOOL_ROUNDS = 6

// Tools whose schema is sent to the LLM. `toolNames` comes from the Jev
// decision: keeping only the relevant schemas is what saves the tokens. An
// empty intersection means Jev and the routed agent disagree, so the agent
// keeps its full set rather than running blind.
const selectTools = (agent: AgentDefinition, toolNames?: string[]) => {
  if (!toolNames) return agent.tools

  const picked = agent.tools.filter((tool) => toolNames.includes(tool.name))

  return picked.length > 0 ? picked : agent.tools
}

// Run one agent's tool loop until it produces a final text answer.
// Each round: ask the LLM -> if it requests tools, execute them on the
// client and feed the results back -> repeat until a plain text reply.
export const runAgent = async (
  agent: AgentDefinition,
  history: AgentMessage[],
  ctx: AgentContext,
  handlers: AgentStreamHandlers = {},
  toolNames?: string[]
): Promise<AgentMessage> => {
  const system = typeof agent.systemPrompt === 'function' ? agent.systemPrompt(ctx) : agent.systemPrompt
  const tools = selectTools(agent, toolNames)
  const messages: AgentMessage[] = [...history]

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    handlers.signal?.throwIfAborted()

    const result = await streamLlm({ system, messages, tools }, { onText: handlers.onText, signal: handlers.signal })

    if (result.toolCalls.length > 0) {
      messages.push({
        role: 'assistant',
        content: result.text,
        toolCalls: result.toolCalls,
      })

      for (const call of result.toolCalls) {
        const tool = agent.tools.find((t) => t.name === call.name)

        handlers.onToolCall?.(call.name)

        let output: string

        try {
          output = tool ? await tool.execute(call.arguments, ctx) : translate('agent.run.toolNotAvailable', {}, 'Tool is not available.')
        } catch (error) {
          output = translate(
            'agent.run.toolError',
            {
              message: error instanceof Error ? error.message : 'Unknown error',
            },
            `Tool error: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }

        messages.push({
          role: 'tool',
          name: call.name,
          toolCallId: call.id,
          content: output,
        })
      }

      continue
    }

    return { role: 'assistant', content: result.text?.trim() || '' }
  }

  return {
    role: 'assistant',
    content: translate('agent.fallback.message', {}, 'I could not finish that request. Please try again.'),
  }
}
