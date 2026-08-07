import type { AgentDefinition, AgentTool } from '../base'

import { AGENT_NAME, ROUTER_TOOL_NAME } from '@/constants/tools'

// Special router tool the main agent uses to pick a specialized agent
export const routeToAgentTool: AgentTool = {
  name: ROUTER_TOOL_NAME,
  description: 'Dispatch the current user message to the specialized agent that should handle it.',
  parameters: {
    type: 'object',
    properties: {
      agent: {
        type: 'string',
        enum: [AGENT_NAME.faq, AGENT_NAME.price, AGENT_NAME.redcommand],
        description: 'The agent best suited to answer the user message.',
      },
    },
    required: ['agent'],
  },
  execute: async (args) => `Dispatching to agent "${args?.agent}".`,
}

// Router system prompt, built from the registry so new agents appear here
// automatically without editing this file.
export const buildRouterSystem = (agents: AgentDefinition[]): string => {
  const list = agents.map((agent) => `- "${agent.name}": ${agent.description}`).join('\n')

  return [
    'You are the coordinator of a chat assistant for the "Giặt Ủi Siêu Sạch" laundry service website.',
    'Your only job is to route the user message to the correct specialized agent.',
    'Available agents:',
    list,
    '',
    'Rules:',
    '- If the message fits one of the agents above, call route_to_agent with that agent name. Choose the single best agent.',
    '- If the message is about nothing the agents cover (small talk, greetings, or unrelated topics), do NOT call any tool. Just reply with the word "FALLBACK".',
    '- Never answer the user yourself; only decide which agent should handle it.',
  ].join('\n')
}
