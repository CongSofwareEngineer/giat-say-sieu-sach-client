import BaseAPI from '@/config/baseApi'

export type PromotionItem = {
  id: string
  title: string
  description?: string
  discountPercent?: number
  startDate?: string
  endDate?: string
}

type ListResponse = { data: PromotionItem[] }

class PromotionApi extends BaseAPI {
  // Fetch all current promotions from the backend
  async getPromotions(): Promise<PromotionItem[]> {
    const response = await this.get<ListResponse>('')

    return response.data
  }
}

const PromotionService = new PromotionApi('promotions')

export default PromotionService
