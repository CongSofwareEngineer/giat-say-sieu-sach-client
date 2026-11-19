import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import { PROMOTION_DISCOUNT_TYPE, PROMOTION_STATUS } from '@/constants/app'
import PromotionService, { getPromotionStatus } from '@/services/promotion'
import { convertPriceToCurrent } from '@/utils/functions'
import { translate } from '@/utils/language'

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

    if (promotions.length === 0) return translate('agent.promotion.empty', {}, 'Hiện tại chưa có chương trình khuyến mãi nào.')

    return promotions
      .map((p) => {
        const amount = p.discountType === PROMOTION_DISCOUNT_TYPE.FIXED_AMOUNT ? convertPriceToCurrent(p.discountValue) : `${p.discountValue}%`
        const discount = p.discountValue ? translate('agent.promotion.discount', { amount }, ` (giảm ${amount})`) : ''
        const code = p.code ? translate('agent.promotion.code', { code: p.code }, ` [mã ${p.code}]`) : ''
        const description = p.description || translate('agent.promotion.noDescription', {}, 'Không có mô tả')

        return translate('agent.promotion.item', { name: p.name, discount, code, description }, `- **${p.name}**${discount}${code}: ${description}`)
      })
      .join('\n')
  },
}
