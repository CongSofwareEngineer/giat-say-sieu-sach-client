import type { AgentDefinition } from '../base'

import { baseTools, getFaqTool } from '../tools'

import { AGENT_NAME } from '@/constants/tools'

// Answers common questions using the FAQ (and site search when needed)
export const faqAgent: AgentDefinition = {
  name: AGENT_NAME.faq,
  description: 'Answers common questions about the laundry service: delivery time, pickup, payment, warranty, premium laundry, booking.',
  systemPrompt: `You are the FAQ specialist of the "Giặt Ủi Siêu Sạch" laundry service.
Always answer using the get_faq tool (or the search tool when needed) so replies stay accurate.
Keep answers short, friendly and helpful.
If the question is not covered by the FAQ, say you don't have that information and suggest contacting support.
Reply in the user's language (use answer_in_language if unsure).`,
  tools: [...baseTools, getFaqTool],
}
