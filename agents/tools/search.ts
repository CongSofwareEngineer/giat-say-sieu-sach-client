import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import FaqService, { FaqItem } from '@/services/faq'
import { mockBlogPosts } from '@/services/mockData'

const searchFaqs = (query: string, faqs: FaqItem[]): FaqItem[] => {
  const q = query.toLowerCase().trim()

  if (!q) return faqs

  return faqs.filter((faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q) || faq.category?.includes(q))
}

// Khớp từ khóa với nội dung FAQ + blog
const searchSite = async (query: string): Promise<string> => {
  const q = query.toLowerCase().trim()
  const faqs = await FaqService.getFaqs()
  const matched = searchFaqs(query, faqs)

  const faqHits = matched
    .slice(0, 5)
    .map((f) => `- ${f.question}: ${f.answer}`)
    .join('\n')

  const blogHits = mockBlogPosts
    .filter((p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.content.toLowerCase().includes(q))
    .slice(0, 3)
    .map((p) => `- ${p.title}: ${p.excerpt}`)
    .join('\n')

  const parts: string[] = []

  if (faqHits) parts.push(`Kết quả FAQ:\n${faqHits}`)
  if (blogHits) parts.push(`Kết quả Blog:\n${blogHits}`)

  return parts.join('\n\n')
}

// Tìm kiếm web miễn phí, không cần key, dùng khi không tìm thấy nội dung liên quan trên site
const searchWeb = async (query: string): Promise<string> => {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) return ''

    const data = await response.json()

    const parts: string[] = []

    if (typeof data.Answer === 'string' && data.Answer) parts.push(data.Answer)
    if (typeof data.AbstractText === 'string' && data.AbstractText) parts.push(data.AbstractText)

    const topics: any[] = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : []

    topics.slice(0, 3).forEach((topic) => {
      if (topic && typeof topic.Text === 'string') parts.push(topic.Text)
    })

    return parts.length ? `Kết quả web:\n${parts.join('\n')}` : ''
  } catch {
    return ''
  }
}

// Tool tìm kiếm mặc định: nội dung site trước, rồi web để lấy thông tin mới nhất
export const searchTool: AgentTool = {
  name: TOOL_NAME.search,
  description: 'Tìm kiếm nội dung site (FAQ, blog) và web để lấy thông tin mới nhất về bất kỳ thứ gì người dùng hỏi.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search keywords, e.g. "thời gian giao hàng".',
      },
    },
    required: ['query'],
  },
  execute: async (args) => {
    const query = String(args?.query ?? '').trim()

    if (!query) return 'Vui lòng cung cấp truy vấn để tìm kiếm.'

    const local = await searchSite(query)

    if (local) return local

    const web = await searchWeb(query)

    return web || `Không tìm thấy kết quả cho "${query}".`
  },
}
