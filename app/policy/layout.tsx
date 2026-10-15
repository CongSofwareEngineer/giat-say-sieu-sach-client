import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'
import MessageVN from '@/public/assets/language/vn.json'

export const metadata: Metadata = buildMetadata({
  title: MessageVN.policy.seo.title,
  description: MessageVN.policy.seo.description,
  path: '/policy',
  keywords: MessageVN.policy.seo.keywords.split(', '),
})

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}
