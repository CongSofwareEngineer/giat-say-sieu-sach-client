import { LOYALTY_REDEEM, WEIGHT_DISCOUNT } from '@/constants/app'

export type OrderPricing = {
  totalAmount: number
  weightDiscount: number
  pointsUsed: number
  pointsDiscount: number
  finalAmount: number
}

// Estimate the order amounts with the same rules as the server:
// weight discount first, then whole blocks of points capped to what is left to pay.
// The server has the final say (it also subtracts points reserved by other active orders).
export const calculateOrderPricing = (totalAmount: number, totalWeight: number, redeemablePoints: number = 0): OrderPricing => {
  const safeTotal = Math.max(0, Math.round(totalAmount))
  const weightDiscount = totalWeight > WEIGHT_DISCOUNT.MIN_KG ? Math.min(WEIGHT_DISCOUNT.AMOUNT, safeTotal) : 0
  const remaining = safeTotal - weightDiscount

  const steps = Math.min(Math.floor(Math.max(0, redeemablePoints) / LOYALTY_REDEEM.POINTS_STEP), Math.floor(remaining / LOYALTY_REDEEM.VND_PER_STEP))
  const pointsUsed = steps * LOYALTY_REDEEM.POINTS_STEP
  const pointsDiscount = steps * LOYALTY_REDEEM.VND_PER_STEP

  return {
    totalAmount: safeTotal,
    weightDiscount,
    pointsUsed,
    pointsDiscount,
    finalAmount: safeTotal - weightDiscount - pointsDiscount,
  }
}

// Max VND a points balance is worth (ignores the order amount)
export const getPointsValue = (points: number = 0): number =>
  Math.floor(Math.max(0, points) / LOYALTY_REDEEM.POINTS_STEP) * LOYALTY_REDEEM.VND_PER_STEP
