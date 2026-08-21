import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import PricingService from '@/services/pricing'

const formatPrice = (price: number, unit?: string): string => `${price.toLocaleString('vi-VN')}đ/${unit || 'kg'}`

// Liệt kê tất cả dịch vụ giặt đang hoạt động với giá mỗi đơn vị
export const getServicesTool: AgentTool = {
  name: TOOL_NAME.getServices,
  description: 'Liệt kê tất cả dịch vụ giặt đang hoạt động và giá mỗi đơn vị.',
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

// Tra cứu giá một dịch vụ theo tên hoặc id
export const getServiceTool: AgentTool = {
  name: TOOL_NAME.getService,
  description: 'Lấy giá của một dịch vụ giặt theo tên hoặc id.',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'Tên hoặc id dịch vụ, ví dụ: "Giặt sấy".',
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

// Ước tính chi phí = giá đơn vị x khối lượng ước tính
export const estimateCostTool: AgentTool = {
  name: TOOL_NAME.estimateCost,
  description: 'Ước tính chi phí đơn giặt từ tên dịch vụ và khối lượng ước tính.',
  parameters: {
    type: 'object',
    properties: {
      serviceName: {
        type: 'string',
        description: 'Service name, e.g. "Giặt sấy".',
      },
      weightKg: {
        type: 'number',
        description: 'Khối lượng ước tính tính bằng kilogram.',
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
