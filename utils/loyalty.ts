import { CUSTOMER_TIER, CUSTOMER_TIER_MIN_POINTS } from '@/constants/app'

// Tiers ordered from lowest to highest min points
const TIERS_ASC = (Object.keys(CUSTOMER_TIER_MIN_POINTS) as CUSTOMER_TIER[]).sort((a, b) => CUSTOMER_TIER_MIN_POINTS[a] - CUSTOMER_TIER_MIN_POINTS[b])

export type CustomerTierInfo = {
  tier: CUSTOMER_TIER
  nextTier: CUSTOMER_TIER | null
  pointsToNext: number
  // 0-100, progress from the current tier to the next one (100 at the top tier)
  progress: number
}

// Resolve the customer tier and progress to the next tier from loyalty points
export const getCustomerTier = (points: number = 0): CustomerTierInfo => {
  const safePoints = Math.max(0, points)
  const tierIndex = TIERS_ASC.reduce((found, tier, index) => (safePoints >= CUSTOMER_TIER_MIN_POINTS[tier] ? index : found), 0)
  const tier = TIERS_ASC[tierIndex]
  const nextTier = TIERS_ASC[tierIndex + 1] ?? null

  if (!nextTier) {
    return { tier, nextTier: null, pointsToNext: 0, progress: 100 }
  }

  const currentMin = CUSTOMER_TIER_MIN_POINTS[tier]
  const nextMin = CUSTOMER_TIER_MIN_POINTS[nextTier]

  return {
    tier,
    nextTier,
    pointsToNext: nextMin - safePoints,
    progress: Math.round(((safePoints - currentMin) / (nextMin - currentMin)) * 100),
  }
}
