import type { AgentContext, AgentStreamHandlers, ChatResult, AgentMessage } from './base'

import { toConversation } from './base'
import { runAgent } from './runAgent'
import { runFastPath } from './fastPath'
import { getAgent } from './agents'
import { decideWithJev } from './agents/router'

// LLM router (disabled, replaced by Jev / System One). Re-enable by restoring
// these imports together with the routeWithLlm block below.
// import { callLlm } from './llm'
// import { routableAgents } from './agents'
// import { buildRouterSystem, routeToAgentTool } from './agents/router'
// import { AGENT_NAME, ROUTER_TOOL_NAME } from '@/constants/tools'

// Previous routing step: a full chat completion (router system prompt + the
// route_to_agent schema + history) spent only on classifying the message.
// Kept here on purpose so it can be switched back on if Jev ever misroutes.
//
// const routeWithLlm = async (conversation: AgentMessage[], handlers: AgentStreamHandlers) => {
//   const routerSystem = buildRouterSystem(routableAgents())
//   const routeResult = await callLlm({ system: routerSystem, messages: conversation, tools: [routeToAgentTool] }, handlers.signal)
//   const routeCall = routeResult.toolCalls.find((tool) => tool.name === ROUTER_TOOL_NAME)
//
//   // No dispatch = out of scope -> default to the fallback agent
//   return routeCall ? getAgent(routeCall.arguments?.agent) : getAgent(AGENT_NAME.fallback)
// }

// Main agent: routes the message to a specialized agent, then runs that agent
// with its own tools until a final answer is produced. Runs entirely on the
// client; the only server calls are the LLM proxy and the System One proxy
// (both hide their API key).
export const chatAgent = {
  async chat(message: string, history: AgentMessage[], ctx: AgentContext, handlers: AgentStreamHandlers = {}): Promise<ChatResult> {
    const conversation = toConversation(history, message)

    // 1) One Jev request answers both decisions in parallel: which agent
    // handles the message, and which tools it may call. Far cheaper and faster
    // than a chat completion; an unusable answer means the fallback agent.
    const decision = await decideWithJev(conversation, handlers.signal)

    const target = getAgent(decision.agent)

    // 2) Agents with a fixed reply (out of scope) answer without any LLM call
    const fixed = typeof target.fixedReply === 'function' ? target.fixedReply(ctx) : target.fixedReply

    if (fixed) {
      const reply: AgentMessage = { role: 'assistant', content: fixed }

      return { text: fixed, history: [...conversation, reply] }
    }

    // 3) Requests whose answer is already decided: run that one tool and
    // return its text, so the turn costs no LLM call either. Not eligible
    // (null) means the agent runs as usual.
    const fastText = decision.fastTool ? await runFastPath(decision.fastTool, message, ctx, handlers) : null

    if (fastText) {
      const reply: AgentMessage = { role: 'assistant', content: fastText }

      return { text: fastText, history: [...conversation, reply] }
    }

    // 4) Run the selected agent, sending only the tool schemas Jev kept
    const reply = await runAgent(target, conversation, ctx, handlers, decision.toolNames)

    return {
      text: reply.content?.trim() || '',
      history: [...conversation, reply],
    }
  },
}
