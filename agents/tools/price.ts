import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import PricingService from '@/services/pricing'

const formatPrice = (price: number, unit?: string): string => `${price.toLocaleString('vi-VN')}đ/${unit || 'kg'}`

// List all active laundry services with their price per unit
export const getServicesTool: AgentTool = {
  name: TOOL_NAME.getServices,
  description: 'List all active laundry services and their price per unit.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const plans = await PricingService.getPlans()
    const active = plans.filter((p) => p.isActive)
    const list = active.map((s) => `- ${s.name}: ${formatPrice(s.price, s.unit)}`).join('\n')

    return `Bảng giá dịch vụ:\n${list}`
  },
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
    const q = String(args?.key ?? '').trim()
    const plans = await PricingService.getPlans()
    const service = plans.find((p) => p.isActive && (p.name.toLowerCase().includes(q.toLowerCase()) || p.id === q))

    if (!service) return `Không tìm thấy dịch vụ "${args?.key}".`

    return `${service.name}: ${formatPrice(service.price, service.unit)}`
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
    const serviceName = String(args?.serviceName ?? '').trim()
    const weight = Number(args?.weightKg)
    const plans = await PricingService.getPlans()
    const service = plans.find((p) => p.isActive && p.name.toLowerCase().includes(serviceName.toLowerCase()))

    if (!service) return `Không tìm thấy dịch vụ "${args?.serviceName}".`
    if (!Number.isFinite(weight) || weight <= 0) return 'Vui lòng cung cấp khối lượng hợp lệ (kg).'

    const total = service.price * weight

    return `Ước tính cho "${service.name}" với ${weight}kg là ${total.toLocaleString('vi-VN')}đ.`
  },
}
