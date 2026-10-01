'use client'

import { Suspense } from 'react'

import TrackOrderContent from './components/TrackOrderContent'

import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { breadcrumbSchema, webPageSchema } from '@/config/seo'

const TrackingPage = () => {
  const { translate } = useLanguage()

  return (
    <div className='py-12 px-4'>
      <SeoJsonLd data={webPageSchema('Theo dõi đơn hàng giặt ủi', '/track-order', 'Tra cứu tình trạng đơn hàng giặt ủi theo thời gian thực')} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Theo dõi đơn', path: '/track-order' },
        ])}
      />
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-text mb-2'>{translate('tracking.title')}</h1>
          <p className='text-gray-600'>{translate('tracking.subtitle')}</p>
        </div>

        {/* useSearchParams needs a Suspense boundary */}
        <Suspense fallback={null}>
          <TrackOrderContent />
        </Suspense>
      </div>
    </div>
  )
}

export default TrackingPage
