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
    'Dùng khi người dùng muốn đặt giặt hoặc đặt lịch gọi đồ (ví dụ: "gỡ đồ", "đặt giặt đồ", "tôi muốn giặt đồ", "đặt lịch giặt"). Hiển thị form đặt hàng trên client.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () =>
    'Người dùng muốn đặt giặt. Xác nhận ngắn gọn rằng bạn đang mở form đặt giặt, ' +
    `sau đó kết thúc câu trả lời bằng marker chính xác ${LAUNDRY_FORM_MARKER} trên một dòng riêng để client hiển thị form.`,
}
