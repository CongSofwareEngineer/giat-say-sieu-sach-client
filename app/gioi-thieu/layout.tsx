import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Giới thiệu',
  description:
    'Tìm hiểu câu chuyện của Giặt Ủi Siêu Sạch - dịch vụ giặt ủi tại nhà TP.HCM từ 2018, 50+ nhân viên chuyên nghiệp, hơn 10.000 khách hàng tin dùng.',
  path: '/gioi-thieu',
  keywords: ['giới thiệu', 'giặt ủi siêu sạch', 'dịch vụ giặt ủi tại nhà', 'về chúng tôi'],
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
