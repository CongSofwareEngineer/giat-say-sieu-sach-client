import type { AgentDefinition } from '../base'

import { baseTools, estimateCostTool, getPromotionsTool, getServiceTool, getServicesTool } from '../tools'

import { AGENT_NAME } from '@/constants/tools'

// Handles pricing questions: service prices, cost estimates and promotions
export const priceAgent: AgentDefinition = {
  name: AGENT_NAME.price,
  description: 'Answers pricing questions: laundry service prices, cost estimates and current promotions.',
  systemPrompt: `You are the pricing specialist of the "Giặt Ủi Siêu Sạch" laundry service.
Use get_services / get_service for prices, estimate_cost to calculate an estimate, and get_promotions for current discounts.
Prices are per kilogram and shown in VND.
Reply in the user's language (use answer_in_language if unsure).`,
  tools: [...baseTools, getServicesTool, getServiceTool, estimateCostTool, getPromotionsTool],
}
