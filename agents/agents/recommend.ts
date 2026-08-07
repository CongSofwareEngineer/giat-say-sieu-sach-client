import type { AgentDefinition } from '../base'

import { baseTools, getBranchesTool, getContactInfoTool, trackOrderTool } from '../tools'

import { AGENT_NAME } from '@/constants/tools'

// Handles order/booking commands: tracking, contact info, branches, booking
export const recommendAgent: AgentDefinition = {
  name: AGENT_NAME.recommend,
  description: 'Handles order and booking commands: tracking an order status, contact info, branch locations and placing a new booking.',
  systemPrompt: `You are the order & booking command specialist of the "Giặt Ủi Siêu Sạch" laundry service.
Use track_order to check an order's status, get_contact_info for contact details and get_branches for branch locations.
If the user wants to place a new booking, collect the needed details (name, phone, pickup address, delivery address, date, service, weight) and guide them to book on the website.
Reply in the user's language (use answer_in_language if unsure).`,
  tools: [...baseTools, trackOrderTool, getContactInfoTool, getBranchesTool],
}
