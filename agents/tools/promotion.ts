import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import PromotionService from '@/services/promotion'

// Lấy khuyến mãi từ API thật
export const getPromotionsTool: AgentTool = {
  name: TOOL_NAME.getPromotions,
  description: 'Lấy các chương trình khuyến mãi và giảm giá mới nhất đang chạy.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const promotions = await PromotionService.getPromotions()

    if (promotions.length === 0) return 'Hiện tại chưa có chương trình khuyến mãi nào.'

    return promotions
      .map((p) => {
        const discount = p.discountPercent ? ` (giảm ${p.discountPercent}%)` : ''

        return `- ${p.title}${discount}: ${p.description || 'Không có mô tả'}`
      })
      .join('\n')
  },
}
