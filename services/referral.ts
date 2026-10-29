import BaseAPI from '@/config/baseApi'
import { QUERY_PAGINATION } from '@/constants/reactQuery'

export type ReferralSummary = {
  referralCode: string
  commissionRate: number
  totalReferred: number
  totalCommissionPoints: number
  totalCommissionOrders: number
}

// Customer created from my link (phone is masked by the server)
export type Referee = {
  id: string
  name: string
  phone: string
  avatar: string | null
  joinedAt: string
  completedOrders: number
  commissionPoints: number
}

// Points earned from one completed order of a referred customer
export type ReferralCommission = {
  id: string
  orderCode: string
  orderAmount: number
  points: number
  refereeName: string
  createdAt: string
}

export type ReferralListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

class ReferralApi extends BaseAPI {
  // Also generates my referral code the first time
  async getSummary(): Promise<ReferralSummary> {
    const response = await this.get<{ data: ReferralSummary }>('/me', { isUseAuth: true })

    return response.data
  }

  async getReferees(params: QUERY_PAGINATION): Promise<{ data: Referee[]; meta?: ReferralListMeta }> {
    return this.get<{ data: Referee[]; meta?: ReferralListMeta }>(`/me/referees?${this.toQuery(params)}`, { isUseAuth: true })
  }

  async getCommissions(params: QUERY_PAGINATION): Promise<{ data: ReferralCommission[]; meta?: ReferralListMeta }> {
    return this.get<{ data: ReferralCommission[]; meta?: ReferralListMeta }>(`/me/commissions?${this.toQuery(params)}`, { isUseAuth: true })
  }

  private toQuery(params: QUERY_PAGINATION): string {
    const query = new URLSearchParams()

    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))

    return query.toString()
  }
}

const ReferralService = new ReferralApi('referrals')

export default ReferralService
