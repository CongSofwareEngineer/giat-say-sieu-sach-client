import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Theo dõi đơn hàng giặt ủi',
  description: 'Theo dõi tình trạng đơn hàng giặt ủi của bạn theo thời gian thực: đã nhận đồ, đang giặt, đang sấy, ủi đồ, đang giao và hoàn thành.',
  path: '/track-order',
  keywords: ['theo dõi đơn hàng', 'tra cứu đơn giặt ủi', 'tình trạng đơn hàng giặt ủi'],
})

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return children
}
