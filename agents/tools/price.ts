import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import PricingService, { PricingPlan } from '@/services/pricing'
import { convertPriceToCurrent } from '@/utils/functions'
import { translate } from '@/utils/language'
import { slugify } from '@/utils/slugify'

const formatPrice = (price: number, unit?: string): string =>
  translate(
    'agent.price.unitPrice',
    { price: convertPriceToCurrent(price) ?? '', unit: unit || 'kg' },
    `${convertPriceToCurrent(price)}/${unit || 'kg'}`
  )

const activePlans = (plans: PricingPlan[]): PricingPlan[] => plans.filter((plan) => plan.isActive)

// Whole price list, also used as the answer when no single service matches
const formatPlanList = (plans: PricingPlan[], headerKey: string, headerFallback: string): string => {
  const active = activePlans(plans)

  if (active.length === 0) return translate('agent.price.empty', {}, 'Hiện chưa có dịch vụ nào trong bảng giá.')

  const list = active
    .map((plan) =>
      translate(
        'agent.price.item',
        { name: plan.name, price: formatPrice(plan.price, plan.unit) },
        `- **${plan.name}**: ${formatPrice(plan.price, plan.unit)}`
      )
    )
    .join('\n')

  return [translate(headerKey, {}, headerFallback), list].join('\n')
}

// The service `text` refers to. `text` is either a service name the model
// passed ("Giặt sấy") or a whole user message ("giặt sấy 5kg bao nhiêu"), so
// the match works both ways; comparing slugs also makes it ignore diacritics
// ("giat say"). Several services mentioned -> the one named first wins.
const findPlan = (plans: PricingPlan[], text: string): PricingPlan | undefined => {
  const query = slugify(text)

  if (!query) return undefined

  const matches = activePlans(plans)
    .map((plan) => ({ plan, slug: slugify(plan.name) }))
    .filter(({ plan, slug }) => slug.length > 0 && (query.includes(slug) || slug.includes(query) || plan.id === text.trim()))
    .map(({ plan, slug }) => ({ plan, position: query.indexOf(slug) }))
    .sort((a, b) => a.position - b.position)

  return matches[0]?.plan
}

// List all active laundry services with their price per unit
export const getServicesTool: AgentTool = {
  name: TOOL_NAME.getServices,
  description: 'List all active laundry services and their price per unit.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => formatPlanList(await PricingService.getPlans(), 'agent.price.listHeader', 'Bảng giá dịch vụ hiện tại:'),
}

// Look up a single service price by name or id
export const getServiceTool: AgentTool = {
  name: TOOL_NAME.getService,
  description: 'Get the price of one laundry service by its name or id.',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'Service name or id, e.g. "Giặt sấy".',
      },
    },
    required: ['key'],
  },
  execute: async (args) => {
    const plans = await PricingService.getPlans()
    const service = findPlan(plans, String(args?.key ?? ''))

    // Unknown service: the full list answers the question anyway, and never
    // echoes the raw query back at the user
    if (!service) return formatPlanList(plans, 'agent.price.serviceNotFound', 'Mình chưa rõ bạn hỏi dịch vụ nào. Đây là bảng giá hiện tại:')

    return translate(
      'agent.price.serviceLine',
      { name: service.name, price: formatPrice(service.price, service.unit) },
      `**${service.name}**: ${formatPrice(service.price, service.unit)}`
    )
  },
}

// Estimate cost = unit price x estimated weight
export const estimateCostTool: AgentTool = {
  name: TOOL_NAME.estimateCost,
  description: 'Estimate the cost of a laundry order from service name and approximate weight.',
  parameters: {
    type: 'object',
    properties: {
      serviceName: {
        type: 'string',
        description: 'Service name, e.g. "Giặt sấy".',
      },
      weightKg: {
        type: 'number',
        description: 'Approximate weight in kilograms.',
      },
    },
    required: ['serviceName', 'weightKg'],
  },
  execute: async (args) => {
    const weight = Number(args?.weightKg)
    const plans = await PricingService.getPlans()
    const service = findPlan(plans, String(args?.serviceName ?? ''))

    if (!service) return formatPlanList(plans, 'agent.price.serviceNotFound', 'Mình chưa rõ bạn hỏi dịch vụ nào. Đây là bảng giá hiện tại:')

    if (!Number.isFinite(weight) || weight <= 0)
      return translate('agent.price.invalidWeight', {}, 'Bạn cho mình biết khối lượng (kg) để mình ước tính giúp nhé.')

    const total = convertPriceToCurrent(service.price * weight) ?? ''

    return translate(
      'agent.price.estimate',
      { name: service.name, weight, total },
      `Ước tính cho **${service.name}** với ${weight}kg là **${total}**.`
    )
  },
}
