import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import { mockPromotions } from '@/services/mockData'

// Simulate API latency before returning the mock promotion list.
// Swap this with PromotionService (real API) once the backend is ready.
const fetchMockPromotions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  return mockPromotions
}

// Current running promotions/discounts from the promotion API
export const getPromotionsTool: AgentTool = {
  name: TOOL_NAME.getPromotions,
  description: 'Get the latest running promotions and discount programs.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const promotions = await fetchMockPromotions()

    if (promotions.length === 0) return 'Hiện tại chưa có chương trình khuyến mãi nào.'

    return promotions
      .map((p) => {
        const discount = p.discountPercent ? ` (giảm ${p.discountPercent}%)` : ''

        return `- ${p.title}${discount}: ${p.description}`
      })
      .join('\n')
  },
}
