import dayjs, { type Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import BaseAPI from '@/config/baseApi'
import { API_CACHE_SECONDS, DISPLAY_DATE_FORMAT, INPUT_DATE_FORMAT, PROMOTION_STATUS, SHOP_TIMEZONE } from '@/constants/app'

dayjs.extend(utc)
dayjs.extend(timezone)

export type PromotionItem = {
  id: string
  title: string
  description?: string
  discountPercent?: number
  startDate?: string
  endDate?: string
}

// null clears a field when updating (undefined keys are dropped by JSON.stringify)
export type PromotionPayload = {
  title: string
  description?: string | null
  discountPercent?: number | null
  startDate?: string | null
  endDate?: string | null
}

type ListResponse = { data: PromotionItem[] }

// Calendar day of a promotion date in the shop time zone, so the server (UTC) and browsers agree
export const toShopDate = (date: string, format: string = INPUT_DATE_FORMAT): string => dayjs(date).tz(SHOP_TIMEZONE).format(format)

// No start date = already running, no end date = never ends (the end date counts as a whole day)
export const getPromotionStatus = (promotion: PromotionItem, now: Dayjs = dayjs()): PROMOTION_STATUS => {
  const today = now.tz(SHOP_TIMEZONE).format(INPUT_DATE_FORMAT)

  // YYYY-MM-DD strings compare correctly as text
  if (promotion.startDate && today < toShopDate(promotion.startDate)) return PROMOTION_STATUS.UPCOMING
  if (promotion.endDate && today > toShopDate(promotion.endDate)) return PROMOTION_STATUS.EXPIRED

  return PROMOTION_STATUS.ACTIVE
}

// "15/10/2026 – 31/10/2026", "Until 31/10/2026", ... depending on which dates are set
export const getPromotionPeriodText = (promotion: PromotionItem, translate: (key: string, variables?: Record<string, string>) => string): string => {
  const from = promotion.startDate ? toShopDate(promotion.startDate, DISPLAY_DATE_FORMAT) : ''
  const to = promotion.endDate ? toShopDate(promotion.endDate, DISPLAY_DATE_FORMAT) : ''

  if (from && to) return translate('promotions.validRange', { from, to })
  if (to) return translate('promotions.validUntil', { date: to })
  if (from) return translate('promotions.validFrom', { date: from })

  return translate('promotions.alwaysOn')
}

class PromotionApi extends BaseAPI {
  // Fetch all promotions from the backend (cached on the Next server, ignored in the browser)
  async getPromotions(): Promise<PromotionItem[]> {
    const response = await this.get<ListResponse>('', { next: { revalidate: API_CACHE_SECONDS } })

    return response?.data ?? []
  }

  async createPromotion(payload: PromotionPayload): Promise<PromotionItem> {
    const response = await this.post<{ data: PromotionItem }>('', payload, { isUseAuth: true })

    return response.data
  }

  async updatePromotion(id: string, payload: PromotionPayload): Promise<PromotionItem> {
    const response = await this.patch<{ data: PromotionItem }>(`/${id}`, payload, { isUseAuth: true })

    return response.data
  }

  async deletePromotion(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`, { isUseAuth: true })
  }
}

const PromotionService = new PromotionApi('promotions')

export default PromotionService
