'use client'

import MyBadge, { MyBadgeVariant } from '@/components/MyBadge'
import StarIcon from '@/components/Icons/Star'
import useLanguage from '@/hooks/useLanguage'
import { CUSTOMER_TIER } from '@/constants/app'
import { getCustomerTier } from '@/utils/loyalty'
import { cn } from '@/utils/tailwind'

export type LoyaltyCardProps = {
  points?: number
}

const TIER_BADGE_VARIANT: Record<CUSTOMER_TIER, MyBadgeVariant> = {
  [CUSTOMER_TIER.SILVER]: 'default',
  [CUSTOMER_TIER.GOLD]: 'warning',
  [CUSTOMER_TIER.DIAMOND]: 'info',
}

const TIER_BAR_COLOR: Record<CUSTOMER_TIER, string> = {
  [CUSTOMER_TIER.SILVER]: 'bg-gray-400',
  [CUSTOMER_TIER.GOLD]: 'bg-amber-500',
  [CUSTOMER_TIER.DIAMOND]: 'bg-sky-500',
}

const LoyaltyCard = ({ points = 0 }: LoyaltyCardProps) => {
  const { translate } = useLanguage()
  const { tier, nextTier, pointsToNext, progress } = getCustomerTier(points)

  return (
    <div className='rounded-xl border border-border bg-background p-4 text-left'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-sm text-gray-500'>{translate('profile.loyalty.tier')}</span>
        <MyBadge variant={TIER_BADGE_VARIANT[tier]} className='gap-1'>
          <StarIcon className='size-3.5' />
          {translate(`profile.loyalty.tiers.${tier}`)}
        </MyBadge>
      </div>

      <div className='mt-3 flex items-baseline gap-1'>
        <span className='text-2xl font-bold text-text'>{points.toLocaleString('vi-VN')}</span>
        <span className='text-sm text-gray-500'>{translate('profile.loyalty.points')}</span>
      </div>

      <div className='mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200'>
        <div className={cn('h-full rounded-full transition-all', TIER_BAR_COLOR[tier])} style={{ width: `${progress}%` }} />
      </div>

      <p className='mt-2 text-xs text-gray-500'>
        {nextTier
          ? translate('profile.loyalty.toNextTier', {
              points: pointsToNext.toLocaleString('vi-VN'),
              tier: translate(`profile.loyalty.tiers.${nextTier}`),
            })
          : translate('profile.loyalty.topTier')}
      </p>
      <p className='mt-1 text-xs text-gray-400'>{translate('profile.loyalty.earnRule')}</p>
    </div>
  )
}

export default LoyaltyCard
