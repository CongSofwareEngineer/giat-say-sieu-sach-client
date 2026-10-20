import dayjs, { type Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import BaseAPI from '@/config/baseApi'
import {
  API_CACHE_SECONDS,
  DISPLAY_DATE_FORMAT,
  FULL_LIST_LIMIT,
  INPUT_DATE_FORMAT,
  PROMOTION_DISCOUNT_TYPE,
  PROMOTION_STATUS,
  SHOP_TIMEZONE,
} from '@/constants/app'
import { convertPriceToCurrent } from '@/utils/functions'

dayjs.extend(utc)
dayjs.extend(timezone)

// Mirrors the server promotion response (formatPromotionResponse)
export type PromotionItem = {
  id: string
  // Empty = informational promotion that cannot be applied to an order
  code: string
  name: string
  description: string
  discountType: PROMOTION_DISCOUNT_TYPE
  // Percent (PERCENTAGE) or VND (FIXED_AMOUNT), 0 = no discount shown
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount: number
  startAt: string | null
  endAt: string | null
  usageLimit: number
  usedCount: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// Mirrors Create/UpdatePromotionDto; null clears code / description / dates when updating
// (undefined keys are dropped by JSON.stringify)
export type PromotionPayload = {
  name: string
  code?: string | null
  description?: string | null
  discountType?: PROMOTION_DISCOUNT_TYPE
  discountValue?: number
  // YYYY-MM-DD = whole day in the shop time zone
  startAt?: string | null
  endAt?: string | null
  isActive?: boolean
}

type ListResponse = { data: PromotionItem[] }

// "Giảm 20%" / "Giảm 10.000đ", empty when the promotion has no discount value
export const getPromotionDiscountText = (
  promotion: Pick<PromotionItem, 'discountType' | 'discountValue'>,
  translate: (key: string, variables?: Record<string, string | number>) => string
): string => {
  if (!promotion.discountValue) return ''

  if (promotion.discountType === PROMOTION_DISCOUNT_TYPE.FIXED_AMOUNT) {
    return translate('promotions.discountAmount', { amount: convertPriceToCurrent(promotion.discountValue) ?? '' })
  }

  return translate('promotions.discount', { percent: promotion.discountValue })
}

// Calendar day of a promotion date in the shop time zone, so the server (UTC) and browsers agree
export const toShopDate = (date: string, format: string = INPUT_DATE_FORMAT): string => dayjs(date).tz(SHOP_TIMEZONE).format(format)

// No start date = already running, no end date = never ends (the end date counts as a whole day)
export const getPromotionStatus = (promotion: PromotionItem, now: Dayjs = dayjs()): PROMOTION_STATUS => {
  const today = now.tz(SHOP_TIMEZONE).format(INPUT_DATE_FORMAT)

  // YYYY-MM-DD strings compare correctly as text
  if (promotion.startAt && today < toShopDate(promotion.startAt)) return PROMOTION_STATUS.UPCOMING
  if (promotion.endAt && today > toShopDate(promotion.endAt)) return PROMOTION_STATUS.EXPIRED

  return PROMOTION_STATUS.ACTIVE
}

// "15/10/2026 – 31/10/2026", "Until 31/10/2026", ... depending on which dates are set
export const getPromotionPeriodText = (promotion: PromotionItem, translate: (key: string, variables?: Record<string, string>) => string): string => {
  const from = promotion.startAt ? toShopDate(promotion.startAt, DISPLAY_DATE_FORMAT) : ''
  const to = promotion.endAt ? toShopDate(promotion.endAt, DISPLAY_DATE_FORMAT) : ''

  if (from && to) return translate('promotions.validRange', { from, to })
  if (to) return translate('promotions.validUntil', { date: to })
  if (from) return translate('promotions.validFrom', { date: from })

  return translate('promotions.alwaysOn')
}

class PromotionApi extends BaseAPI {
  // Public list: enabled and not ended yet (cached on the Next server, ignored in the browser)
  async getPromotions(): Promise<PromotionItem[]> {
    const response = await this.get<ListResponse>(`?limit=${FULL_LIST_LIMIT}`, { next: { revalidate: API_CACHE_SECONDS } })

    return response?.data ?? []
  }

  // Admin: all promotions, disabled and ended ones included
  async getAdminPromotions(): Promise<PromotionItem[]> {
    const response = await this.get<ListResponse>(`/admin?limit=${FULL_LIST_LIMIT}`, { isUseAuth: true })

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
