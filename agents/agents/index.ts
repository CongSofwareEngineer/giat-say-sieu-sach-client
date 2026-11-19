import type { AgentDefinition } from '../base'

import { fallbackAgent } from './fallback'
import { faqAgent } from './faq'
import { priceAgent } from './price'
import { recommendAgent } from './recommend'

import { AGENT_NAME } from '@/constants/tools'

// Agent registry. Add a new agent here (and its name in constants/tools.ts)
// to make it routable by the main agent.
export const AGENT_REGISTRY: Record<string, AgentDefinition> = {
  [AGENT_NAME.faq]: faqAgent,
  [AGENT_NAME.price]: priceAgent,
  [AGENT_NAME.recommend]: recommendAgent,
  [AGENT_NAME.fallback]: fallbackAgent,
}

// Unknown agent names fall back to the off-topic handler
export const getAgent = (name: unknown): AgentDefinition => (typeof name === 'string' && AGENT_REGISTRY[name] ? AGENT_REGISTRY[name] : fallbackAgent)

// Specialized agents the router may dispatch to: every registered agent except
// fallback, in registry order. A new agent in AGENT_REGISTRY is routable at once.
export const routableAgents = (): AgentDefinition[] => Object.values(AGENT_REGISTRY).filter((agent) => agent.name !== AGENT_NAME.fallback)
