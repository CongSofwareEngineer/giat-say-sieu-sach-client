import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import FaqService, { FaqItem } from '@/services/faq'
import { mockBlogPosts } from '@/services/mockData'

const searchFaqs = (query: string, faqs: FaqItem[]): FaqItem[] => {
  const q = query.toLowerCase().trim()

  if (!q) return faqs

  return faqs.filter((faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q) || faq.category?.includes(q))
}

// Keyword match against FAQ + blog content
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

  if (faqHits) parts.push(`FAQ results:\n${faqHits}`)
  if (blogHits) parts.push(`Blog results:\n${blogHits}`)

  return parts.join('\n\n')
}

// Free, key-less web search used when nothing relevant is found on the site
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

    return parts.length ? `Web results:\n${parts.join('\n')}` : ''
  } catch {
    return ''
  }
}

// Default search tool: site content first, then the web for fresh information
export const searchTool: AgentTool = {
  name: TOOL_NAME.search,
  description: 'Search site content (FAQ, blog) and the web for up-to-date information about anything the user asks.',
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

    if (!query) return 'Please provide a query to search.'

    const local = await searchSite(query)

    if (local) return local

    const web = await searchWeb(query)

    return web || `No results found for "${query}".`
  },
}
