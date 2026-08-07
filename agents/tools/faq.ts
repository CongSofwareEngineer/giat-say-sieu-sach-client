import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import { searchFaqs } from '@/services/faq'

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
    const faqs = searchFaqs(query)

    if (faqs.length === 0) return `No FAQ found for "${query}".`

    return faqs
      .slice(0, 5)
      .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n\n')
  },
}
