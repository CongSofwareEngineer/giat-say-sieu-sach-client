import BaseAPI from '@/config/baseApi'

export type FaqItem = {
  id: string
  question: string
  answer: string
  category?: string
}

type ListResponse = { data: FaqItem[] }

const CACHE_KEY = 'faqs_cache'
const CACHE_DURATION = 3 * 24 * 60 * 60 * 1000

const getCachedFaqs = (): { data: FaqItem[]; timestamp: number } | null => {
  if (typeof window === 'undefined') return null

  const cached = localStorage.getItem(CACHE_KEY)

  if (!cached) return null

  try {
    const parsed = JSON.parse(cached) as { data: FaqItem[]; timestamp: number }

    return parsed
  } catch {
    return null
  }
}

const setCachedFaqs = (data: FaqItem[]): void => {
  if (typeof window === 'undefined') return

  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION
}

class FaqApi extends BaseAPI {
  async getFaqs(): Promise<FaqItem[]> {
    const cached = getCachedFaqs()

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data
    }

    const response = await this.get<ListResponse>('')

    setCachedFaqs(response.data)

    return response.data
  }
}

const FaqService = new FaqApi('faqs')

export default FaqService
