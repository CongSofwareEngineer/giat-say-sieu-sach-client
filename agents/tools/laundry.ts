import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import { translate } from '@/utils/language'

// Marker embedded in the agent's final reply so the client can detect a
// laundry booking intent and render the order form instead of plain text.
export const LAUNDRY_FORM_MARKER = '[LAUNDRY_FORM]'

// Opens the laundry booking form on the client when the user asks to book a
// pickup ("gỡ đồ", "đặt giặt đồ", "tôi muốn giặt đồ", ...).
// The output is the finished reply (fixed sentence + the marker on its own
// line), so the fast path can answer with it without any LLM call.
export const openLaundryFormTool: AgentTool = {
  name: TOOL_NAME.laundry,
  description:
    'Use when the user wants to book or order a laundry pickup/order (e.g. "gỡ đồ", "đặt giặt đồ", "tôi muốn giặt đồ", "đặt lịch giặt"). Triggers the order form on the client.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () =>
    [
      translate('agent.laundry.formOpening', {}, 'Dạ, mình mở form đặt lịch giặt cho bạn ngay đây, bạn điền thông tin bên dưới nhé.'),
      LAUNDRY_FORM_MARKER,
    ].join('\n'),
}
