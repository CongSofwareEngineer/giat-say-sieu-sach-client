import PromotionList from './components/PromotionList'

import SeoJsonLd from '@/components/SeoJsonLd'
import PromotionService, { getPromotionStatus } from '@/services/promotion'
import { breadcrumbSchema, webPageSchema } from '@/config/seo'
import { IS_BUILD_PHASE, PROMOTION_STATUS } from '@/constants/app'
import MessageVN from '@/public/assets/language/vn.json'

// Regenerate the cached page at most once per minute so new promotions show up
export const revalidate = 60

const PromotionsPage = async () => {
  // Same as the pricing page: skip API errors during the build, keep the last good page at runtime
  const promotions =
    (await PromotionService.getPromotions().catch((error) => {
      if (IS_BUILD_PHASE) return []

      throw error
    })) ?? []

  // Hide ended promotions; running ones first, then upcoming
  const visiblePromotions = promotions
    .map((promotion) => ({ promotion, status: getPromotionStatus(promotion) }))
    .filter(({ status }) => status !== PROMOTION_STATUS.EXPIRED)
    .sort((a, b) => Number(a.status === PROMOTION_STATUS.UPCOMING) - Number(b.status === PROMOTION_STATUS.UPCOMING))

  return (
    <div className='py-16 lg:py-24'>
      <SeoJsonLd data={webPageSchema(MessageVN.promotions.seo.title, '/promotions', MessageVN.promotions.seo.description)} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: MessageVN.menu.home, path: '/' },
          { name: MessageVN.menu.promotions, path: '/promotions' },
        ])}
      />
      <PromotionList promotions={visiblePromotions} />
    </div>
  )
}

export default PromotionsPage
