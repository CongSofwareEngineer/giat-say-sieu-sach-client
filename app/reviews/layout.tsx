import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Đánh giá dịch vụ giặt ủi',
  description:
    'Xem đánh giá thực tế và chia sẻ trải nghiệm của bạn về dịch vụ giặt ủi siêu sạch: giặt thường, giặt nhanh, giặt khô, ủi đồ. Đánh giá kèm hình ảnh.',
  path: '/reviews',
  keywords: ['đánh giá giặt ủi', 'review dịch vụ giặt ủi', 'khách hàng nhận xét', 'đánh giá bảng giá giặt ủi'],
})

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
