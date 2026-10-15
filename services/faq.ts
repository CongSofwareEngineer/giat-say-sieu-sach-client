import BaseAPI from '@/config/baseApi'
import { FAQ_CACHE_DURATION, FULL_LIST_LIMIT, LOCAL_STORAGE_KEY } from '@/constants/app'

export type FaqItem = {
  id: string
  question: string
  answer: string
  category?: string
  tags?: string[]
  isActive?: boolean
}

export type FaqPayload = {
  question: string
  answer: string
  category: string
  tags?: string[]
  isActive?: boolean
}

type ListResponse = { data: FaqItem[] }

const getCachedFaqs = (): { data: FaqItem[]; timestamp: number } | null => {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY.faqs)

    if (!cached) return null

    return JSON.parse(cached) as { data: FaqItem[]; timestamp: number }
  } catch {
    return null
  }
}

const setCachedFaqs = (data: FaqItem[]): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY.faqs, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

// Drop the local cache so this browser sees admin changes right away
const clearCachedFaqs = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY.faqs)
  } catch {}
}

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < FAQ_CACHE_DURATION
}

class FaqApi extends BaseAPI {
  // Active FAQs, served from localStorage until the cache expires
  async getFaqs(): Promise<FaqItem[]> {
    const cached = getCachedFaqs()

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data
    }

    const response = await this.get<ListResponse>(`?limit=${FULL_LIST_LIMIT}`)

    setCachedFaqs(response.data)

    return response.data
  }

  // Admin: all FAQs, hidden ones included
  async getAdminFaqs(): Promise<FaqItem[]> {
    const response = await this.get<ListResponse>(`/admin?limit=${FULL_LIST_LIMIT}`, { isUseAuth: true })

    return response?.data ?? []
  }

  async createFaq(payload: FaqPayload): Promise<FaqItem> {
    const response = await this.post<{ data: FaqItem }>('', payload, {
      isUseAuth: true,
    })

    clearCachedFaqs()

    return response.data
  }

  async updateFaq(id: string, payload: Partial<FaqPayload>): Promise<FaqItem> {
    const response = await this.patch<{ data: FaqItem }>(`/${id}`, payload, {
      isUseAuth: true,
    })

    clearCachedFaqs()

    return response.data
  }

  async deleteFaq(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`, { isUseAuth: true })

    clearCachedFaqs()
  }
}

const FaqService = new FaqApi('faqs')

export default FaqService
