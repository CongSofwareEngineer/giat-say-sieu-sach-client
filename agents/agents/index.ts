import type { AgentDefinition } from '../base'

import { fallbackAgent } from './fallback'
import { faqAgent } from './faq'
import { priceAgent } from './price'
import { recommendAgent } from './recommend'
import { bookingAgent } from './booking'

import { AGENT_NAME } from '@/constants/tools'

// Agent registry. Add a new agent here (and its name in constants/tools.ts)
// to make it routable by the main agent.
export const AGENT_REGISTRY: Record<string, AgentDefinition> = {
  [AGENT_NAME.faq]: faqAgent,
  [AGENT_NAME.price]: priceAgent,
  [AGENT_NAME.recommend]: recommendAgent,
  [AGENT_NAME.booking]: bookingAgent,
  [AGENT_NAME.fallback]: fallbackAgent,
}

// Unknown agent names fall back to the off-topic handler
export const getAgent = (name: unknown): AgentDefinition => (typeof name === 'string' && AGENT_REGISTRY[name] ? AGENT_REGISTRY[name] : fallbackAgent)

// Specialized agents the router may dispatch to (excludes fallback)
export const routableAgents = (): AgentDefinition[] =>
  [AGENT_NAME.faq, AGENT_NAME.price, AGENT_NAME.recommend, AGENT_NAME.booking].map((name) => AGENT_REGISTRY[name])
