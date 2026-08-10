import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'

// Marker embedded in the agent's final reply so the client can detect a
// laundry booking intent and render the order form instead of plain text.
export const LAUNDRY_FORM_MARKER = '[LAUNDRY_FORM]'

// Opens the laundry booking form on the client when the user asks to book a
// pickup ("gỡ đồ", "đặt giặt đồ", "tôi muốn giặt đồ", ...).
export const openLaundryFormTool: AgentTool = {
  name: TOOL_NAME.laundry,
  description:
    'Use when the user wants to book or order a laundry pickup/order (e.g. "gỡ đồ", "đặt giặt đồ", "tôi muốn giặt đồ", "đặt lịch giặt"). Triggers the order form on the client.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () =>
    'The user wants to book laundry. Confirm briefly that you are opening the laundry order form, ' +
    `then end your reply with the exact marker ${LAUNDRY_FORM_MARKER} on its own line so the client shows the form.`,
}
