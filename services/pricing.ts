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

export type UpdatePricingPlanPayload = {
  name?: string
  description?: string
  price?: number
  unit?: string
  isActive?: boolean
  features?: Record<LANGUAGE_SUPPORT, string[]>
  popular?: boolean
}

class PricingApi extends BaseAPI {
  async getPlans(): Promise<PricingPlan[]> {
    const response = await this.get<{ data: PricingPlan[] }>('')

    return response?.data
  }

  async updatePlan(id: string, payload: UpdatePricingPlanPayload): Promise<PricingPlan> {
    const response = await this.patch<{ data: PricingPlan }>(`/${id}`, payload, { isUseAuth: true })

    return response.data
  }

  async deletePlan(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`, { isUseAuth: true })
  }

  async createPlan(payload: {
    name: string
    description?: string
    features?: Record<string, string[]>
    unit?: string
    price: number
    popular?: boolean
  }): Promise<PricingPlan> {
    const response = await this.post<{ data: PricingPlan }>('/', payload, { isUseAuth: true })

    return response.data
  }
}

const PricingService = new PricingApi('laundry-categories')

export default PricingService
