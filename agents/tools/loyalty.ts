import type { AgentTool } from '../base'

import { LOYALTY_REDEEM } from '@/constants/app'
import { TOOL_NAME } from '@/constants/tools'
import UserService from '@/services/users'
import { getCustomerTier } from '@/utils/loyalty'
import { getPointsValue } from '@/utils/orderPricing'
import { translate } from '@/utils/language'

const formatVnd = (value: number): string => value.toLocaleString('vi-VN')

// Logged-in user's loyalty points, tier and progress to the next tier
export const getMyLoyaltyTool: AgentTool = {
  name: TOOL_NAME.getMyLoyalty,
  description:
    'Get the logged in user loyalty points, membership tier, points needed for the next tier and how much the points are worth at booking. Use when the user asks about their points or tier ("điểm của tôi", "hạng thành viên", "my points").',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (_args, ctx) => {
    // Points live on the account (GET /users/me is authenticated)
    if (!ctx?.userId) return translate('agent.loyalty.requireLogin', {}, 'Bạn cần đăng nhập để xem điểm tích lũy và hạng thành viên.')

    // Fresh balance from the server: the persisted store may be stale
    const profile = await UserService.getProfile()
    const points = Math.max(0, Number(profile?.loyaltyPoints) || 0)
    const { tier, nextTier, pointsToNext } = getCustomerTier(points)
    const tierName = translate(`profile.loyalty.tiers.${tier}`, {}, tier)

    const lines = [
      translate(
        'agent.loyalty.summary',
        { tier: tierName, points: formatVnd(points), value: formatVnd(getPointsValue(points)) },
        `Hạng thành viên: **${tierName}**\nĐiểm tích lũy: **${points} điểm** (đổi được ${getPointsValue(points)}đ khi đặt lịch)`
      ),
      nextTier
        ? translate('profile.loyalty.toNextTier', {
            points: formatVnd(pointsToNext),
            tier: translate(`profile.loyalty.tiers.${nextTier}`, {}, nextTier),
          })
        : translate('profile.loyalty.topTier'),
      translate('profile.loyalty.earnRule'),
      translate(
        'agent.loyalty.redeemRule',
        { step: LOYALTY_REDEEM.POINTS_STEP, amount: formatVnd(LOYALTY_REDEEM.VND_PER_STEP) },
        `Cứ ${LOYALTY_REDEEM.POINTS_STEP} điểm được giảm ${LOYALTY_REDEEM.VND_PER_STEP}đ khi đặt lịch.`
      ),
    ]

    return lines.join('\n')
  },
}
