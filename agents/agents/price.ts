import type { AgentDefinition } from '../base'

import { baseTools, estimateCostTool, getPromotionsTool, getServiceTool, getServicesTool } from '../tools'

import { AGENT_NAME } from '@/constants/tools'

// Xử lý câu hỏi về giá: giá dịch vụ, ước tính chi phí và khuyến mãi
export const priceAgent: AgentDefinition = {
  name: AGENT_NAME.price,
  description: 'Trả lời câu hỏi về giá: giá dịch vụ giặt, ước tính chi phí và khuyến mãi hiện tại.',
  systemPrompt: `Bạn là chuyên gia về giá của dịch vụ giặt ủi "Giặt Ủi Siêu Sạch".
Dùng get_services / get_service để xem giá, estimate_cost để tính ước tính, và get_promotions để xem khuyến mãi hiện tại.
Giá tính theo kilogram và hiển thị bằng VND.
Trả lời bằng ngôn ngữ của người dùng (dùng answer_in_language nếu không chắc).`,
  tools: [...baseTools, getServicesTool, getServiceTool, estimateCostTool, getPromotionsTool],
}
