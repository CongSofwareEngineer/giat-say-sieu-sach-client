import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import FaqService, { FaqItem } from '@/services/faq'

export const searchFaqs = (query: string, faqs: FaqItem[]): FaqItem[] => {
  const q = query.toLowerCase().trim()

  if (!q) return faqs

  return faqs.filter((faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q) || faq.category?.includes(q))
}

// Trả lời các câu hỏi thường gặp trực tiếp từ danh sách FAQ
export const getFaqTool: AgentTool = {
  name: TOOL_NAME.getFaq,
  description: 'Tra cứu FAQ của site cho câu hỏi thường gặp (thời gian giao hàng, gọi đồ, thanh toán, bảo hành, giặt cao cấp...).',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Câu hỏi hoặc từ khóa để tìm trong FAQ, ví dụ: "thời gian giao hàng".',
      },
    },
    required: ['query'],
  },
  execute: async (args) => {
    const query = String(args?.query ?? '').trim()
    const faqs = await FaqService.getFaqs()
    const matched = searchFaqs(query, faqs)

    if (matched.length === 0) return `Không tìm thấy FAQ cho "${query}".`

    return matched
      .slice(0, 5)
      .map((f) => `Câu hỏi: ${f.question}\nTrả lời: ${f.answer}`)
      .join('\n\n')
  },
}
