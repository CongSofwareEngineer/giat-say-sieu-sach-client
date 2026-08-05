import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Bảng giá giặt ủi',
  description:
    'Bảng giá giặt ủi rõ ràng, không phí ẩn: giặt thường 25.000đ/kg, giặt nhanh 40.000đ/kg, giặt khô 80.000đ/kg, ủi đồ 15.000đ/cái. Đặt lịch ngay!',
  path: '/bang-gia',
  keywords: ['bảng giá giặt ủi', 'giá giặt sấy', 'giá giặt khô', 'giá ủi đồ', 'dịch vụ giặt ủi giá rẻ'],
})

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
