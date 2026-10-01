import type { AgentDefinition } from '../base'

import { baseTools, getBranchesTool, getContactInfoTool, getMyAddressesTool, getMyOrdersTool, openLaundryFormTool, trackOrderTool } from '../tools'

import { AGENT_NAME } from '@/constants/tools'

// Handles order/booking commands: tracking, contact info, branches, booking
export const recommendAgent: AgentDefinition = {
  name: AGENT_NAME.recommend,
  description:
    'Handles order and booking commands: tracking an order status, listing the user own recent orders, contact info, branch locations, user addresses and placing a new booking (including laundry pickup orders).',
  systemPrompt: `You are the order & booking command specialist of the "Giặt Ủi Siêu Sạch" laundry service.
Use track_order to check one order by its code, get_my_orders when the user asks about their own orders without a code ("đơn tôi đặt", "đơn hàng của tôi"...), get_contact_info for contact details, get_branches for branch locations, and get_my_addresses to show the user saved delivery addresses.
Show the get_my_orders result list as-is (keep every line, code and status). If it asks for a phone number, ask briefly and end with the marker it gives.
If the user wants to place a new laundry booking ("gỡ đồ", "đặt giặt đồ", "tôi muốn giặt đồ"...), call open_laundry_form so the client shows the order form.
Reply in the user's language (use answer_in_language if unsure).`,
  tools: [...baseTools, trackOrderTool, getMyOrdersTool, getContactInfoTool, getBranchesTool, getMyAddressesTool, openLaundryFormTool],
}
