import type { AgentContext, ChatResult, AgentMessage } from './base'

import { toConversation } from './base'
import { callLlm } from './llm'
import { runAgent } from './runAgent'
import { getAgent, routableAgents } from './agents'
import { buildRouterSystem, routeToAgentTool } from './agents/router'

import { AGENT_NAME, ROUTER_TOOL_NAME } from '@/constants/tools'

// Main agent: routes the message to a specialized agent, then runs that agent
// with its own tools until a final answer is produced. Runs entirely on the
// client; the only server call is the LLM proxy (hides the API key).
export const chatAgent = {
  async chat(message: string, history: AgentMessage[], ctx: AgentContext): Promise<ChatResult> {
    const conversation = toConversation(history, message)

    // 1) Main agent decides which specialized agent should handle the message
    const routerSystem = buildRouterSystem(routableAgents())
    const routeResult = await callLlm({
      system: routerSystem,
      messages: conversation,
      tools: [routeToAgentTool],
    })

    const routeCall = routeResult.toolCalls.find((tool) => tool.name === ROUTER_TOOL_NAME)

    // No dispatch = out of scope -> default to the fallback agent
    const target = routeCall ? getAgent(routeCall.arguments?.agent) : getAgent(AGENT_NAME.fallback)

    // 2) Run the selected agent with its own tool set
    const reply = await runAgent(target, conversation, ctx)

    return {
      text: reply.content?.trim() || '',
      history: [...conversation, reply],
    }
  },
}
