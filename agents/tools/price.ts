import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import { mockServices } from '@/services/mockData'

const formatPrice = (price: number): string => `${price.toLocaleString('vi-VN')}đ`

const findService = (key?: string) => {
  const q = String(key ?? '')
    .toLowerCase()
    .trim()

  if (!q) return undefined

  return mockServices.find((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
}

// List all laundry services with their price per kg
export const getServicesTool: AgentTool = {
  name: TOOL_NAME.getServices,
  description: 'List all laundry services and their price (per kg).',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const list = mockServices.map((s) => `- ${s.name}: ${formatPrice(s.price)}/kg`).join('\n')

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
    const service = findService(String(args?.key ?? ''))

    if (!service) return `Không tìm thấy dịch vụ "${args?.key}".`

    return `${service.name}: ${formatPrice(service.price)}/kg`
  },
}

// Estimate cost = unit price per kg x estimated weight
export const estimateCostTool: AgentTool = {
  name: TOOL_NAME.estimateCost,
  description: 'Estimate the cost of a laundry order from service name and approximate weight in kg.',
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
    const service = findService(String(args?.serviceName ?? ''))
    const weight = Number(args?.weightKg)

    if (!service) return `Không tìm thấy dịch vụ "${args?.serviceName}".`
    if (!Number.isFinite(weight) || weight <= 0) return 'Please provide a valid weight in kg.'

    const total = service.price * weight

    return `Ước tính cho "${service.name}" với ${weight}kg là ${formatPrice(total)}.`
  },
}
