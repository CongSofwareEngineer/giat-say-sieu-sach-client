import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'
import MessageVN from '@/public/assets/language/vn.json'

export const metadata: Metadata = buildMetadata({
  title: MessageVN.promotions.seo.title,
  description: MessageVN.promotions.seo.description,
  path: '/promotions',
  keywords: MessageVN.promotions.seo.keywords.split(', '),
})

export default function PromotionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
