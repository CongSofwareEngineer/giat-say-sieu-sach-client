import { BaseTools, pickTools, type ToolDefinition, type ToolSetOptions } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import { mockPromotions } from '@/services/mockData'
import PromotionService from '@/services/promotion'

const buildPromotionTools = (): ToolDefinition<any, unknown>[] => [
  // Return the running promotion programs from the API
  {
    name: TOOL_NAME.getPromotions,
    description: 'Return the current promotions (chương trình khuyến mãi) so the customer knows what is on sale.',
    handler: async () => {
      try {
        return await PromotionService.getPromotions()
      } catch {
        return mockPromotions
      }
    },
  },
]

// Promotion tool set: informs the customer about running campaigns
export class PromotionTools extends BaseTools {
  constructor(options: ToolSetOptions = {}) {
    super()

    this.register(...pickTools(buildPromotionTools(), options.only))
  }
}

export default PromotionTools
