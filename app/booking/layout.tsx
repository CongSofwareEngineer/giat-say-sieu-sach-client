import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Đặt lịch giặt ủi tại nhà',
  description: 'Đặt lịch giặt ủi online trong 2 phút. Nhân viên lấy đồ tận nhà miễn phí tại TP.HCM, giặt sạch, ủi phẳng, giao đúng hẹn 24h.',
  path: '/booking',
  keywords: ['đặt lịch giặt ủi', 'đặt lịch giặt đồ tại nhà', 'dịch vụ giặt ủi online'],
})

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children
}
