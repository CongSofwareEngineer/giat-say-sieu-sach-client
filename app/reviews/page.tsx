'use client'

import CommentSection from '@/components/Comment/CommentSection'
import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { breadcrumbSchema, localBusinessSchema, SERVICE_OFFERS, webPageSchema } from '@/config/seo'

const ReviewsPage = () => {
  const { translate } = useLanguage()

  return (
    <div className='py-16 lg:py-24'>
      <SeoJsonLd data={localBusinessSchema(SERVICE_OFFERS)} />
      <SeoJsonLd data={webPageSchema('Đánh giá dịch vụ giặt ủi', '/reviews', 'Đánh giá và nhận xét từ khách hàng về dịch vụ giặt ủi siêu sạch')} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Đánh giá', path: '/reviews' },
        ])}
      />
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <CommentSection
          tag={translate('reviews.tag')}
          title={translate('reviews.title')}
          subtitle={translate('reviews.subtitle')}
          headingLevel='h1'
        />
      </div>
    </div>
  )
}

export default ReviewsPage
