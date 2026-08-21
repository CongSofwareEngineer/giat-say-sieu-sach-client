import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import FaqService, { FaqItem } from '@/services/faq'

export const searchFaqs = (query: string, faqs: FaqItem[]): FaqItem[] => {
  const q = query.toLowerCase().trim()

  if (!q) return faqs

  return faqs.filter((faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q) || faq.category?.includes(q))
}

// Answers common questions straight from the FAQ list
export const getFaqTool: AgentTool = {
  name: TOOL_NAME.getFaq,
  description: 'Look up the site FAQ for a common question (delivery time, pickup, payment, warranty, premium laundry...).',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The question or keywords to find in the FAQ, e.g. "thời gian giao hàng".',
      },
    },
    required: ['query'],
  },
  execute: async (args) => {
    const query = String(args?.query ?? '').trim()
    const faqs = await FaqService.getFaqs()
    const matched = searchFaqs(query, faqs)

    if (matched.length === 0) return `No FAQ found for "${query}".`

    return matched
      .slice(0, 5)
      .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n\n')
  },
}
