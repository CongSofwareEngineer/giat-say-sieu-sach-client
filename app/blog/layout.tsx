import type { Metadata } from 'next'

import { buildMetadata } from '@/config/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Blog & Tin tức giặt ủi',
  description:
    'Cẩm nang giặt giũ: mẹo giặt quần áo đúng cách, bảo quản vest comple, giải mã ký hiệu giặt là và nhiều kiến thức hữu ích từ Giặt Ủi Siêu Sạch.',
  path: '/blog',
  keywords: ['mẹo giặt giũ', 'mẹo giặt quần áo', 'bảo quản quần áo', 'tin tức giặt ủi'],
})

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
