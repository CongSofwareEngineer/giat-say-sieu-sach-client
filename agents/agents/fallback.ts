import type { AgentDefinition } from '../base'

import { answerInLanguageTool } from '../tools'

import { AGENT_NAME } from '@/constants/tools'

// Fallback agent: handles off-topic messages and small talk
export const fallbackAgent: AgentDefinition = {
  name: AGENT_NAME.fallback,
  description: 'Handles off-topic messages, small talk and anything outside the specialized agents.',
  systemPrompt: `You are a friendly assistant of the "Giặt Ủi Siêu Sạch" laundry service website.
The user's message does not match any specialized topic (FAQ, pricing, orders).
Be polite: greet or thank them, briefly explain you can only help with laundry service questions (services and prices, promotions, FAQ, order tracking, contact), and invite them to ask about those.
Keep it short and natural.
Reply in the user's language (use answer_in_language if unsure).`,
  tools: [answerInLanguageTool],
}
