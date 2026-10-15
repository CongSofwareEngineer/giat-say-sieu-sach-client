import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import { PROMOTION_STATUS } from '@/constants/app'
import PromotionService, { getPromotionStatus } from '@/services/promotion'

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
    // Ended promotions stay in the API until an admin deletes them
    const promotions = (await PromotionService.getPromotions()).filter((p) => getPromotionStatus(p) !== PROMOTION_STATUS.EXPIRED)

    if (promotions.length === 0) return 'Hiện tại chưa có chương trình khuyến mãi nào.'

    return promotions
      .map((p) => {
        const discount = p.discountPercent ? ` (giảm ${p.discountPercent}%)` : ''

        return `- ${p.title}${discount}: ${p.description || 'Không có mô tả'}`
      })
      .join('\n')
  },
}
