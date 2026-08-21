import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import PromotionService from '@/services/promotion'

// Fetch promotions from the real API
export const getPromotionsTool: AgentTool = {
  name: TOOL_NAME.getPromotions,
  description: 'Get the latest running promotions and discount programs.',
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
