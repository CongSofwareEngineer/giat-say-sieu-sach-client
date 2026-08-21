import BaseAPI from '@/config/baseApi'

export type FaqItem = {
  id: string
  question: string
  answer: string
  category?: string
}

type ListResponse = { data: FaqItem[] }

class FaqApi extends BaseAPI {
  async getFaqs(): Promise<FaqItem[]> {
    const response = await this.get<ListResponse>('')

    return response.data
  }
}

const FaqService = new FaqApi('faqs')

export default FaqService
