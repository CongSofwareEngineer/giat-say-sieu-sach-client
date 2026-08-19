import BaseAPI from '@/config/baseApi'
import { LANGUAGE_SUPPORT } from '@/zustand/language'

export type PricingPlan = {
  id: string
  name: string
  description: string
  features: Record<LANGUAGE_SUPPORT, string[]>
  unit: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type ListResponse = { data: PricingPlan[] }

class PricingApi extends BaseAPI {
  async getPlans(): Promise<PricingPlan[]> {
    const response = await this.get<ListResponse>('')

    return response.data
  }
}

const PricingService = new PricingApi('pricing')

export default PricingService
