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
  popular?: boolean
}

class PricingApi extends BaseAPI {
  async getPlans(): Promise<PricingPlan[]> {
    const response = await this.get<{ data: PricingPlan[] }>('')

    return response?.data
  }
}

const PricingService = new PricingApi('laundry-categories')

export default PricingService
