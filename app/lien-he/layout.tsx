import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Liên hệ',
  description:
    'Liên hệ Giặt Ủi Siêu Sạch qua hotline 0392 225 405, email contact@giatsaysieusach.com. Tư vấn miễn phí, đặt lịch lấy đồ tận nhà nhanh chóng.',
  path: '/lien-he',
  keywords: ['liên hệ', 'hotline giặt ủi', 'tư vấn giặt ủi', 'email liên hệ'],
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
