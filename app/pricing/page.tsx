import PricingPlans from './components/PricingPlans'

import SeoJsonLd from '@/components/SeoJsonLd'
import PricingService from '@/services/pricing'
import { breadcrumbSchema, localBusinessSchema, serviceSchema, toServiceOffers } from '@/config/seo'
import { IS_BUILD_PHASE } from '@/constants/app'

// Regenerate the cached page at most once per minute so price changes show up
export const revalidate = 60

const PriceListPage = async () => {
  // Don't fail the build when the API is down; ISR refetches after `revalidate`.
  // At runtime the error is rethrown so the last good cached page is kept.
  const plans =
    (await PricingService.getPlans().catch((error) => {
      if (IS_BUILD_PHASE) return []

      throw error
    })) ?? []
  const offers = toServiceOffers(plans)

  return (
    <div className='py-16 lg:py-24'>
      <SeoJsonLd data={localBusinessSchema(offers)} />
      <SeoJsonLd data={serviceSchema(offers)} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Bảng giá', path: '/pricing' },
        ])}
      />
      <PricingPlans plans={plans} />
    </div>
  )
}

export default PriceListPage
