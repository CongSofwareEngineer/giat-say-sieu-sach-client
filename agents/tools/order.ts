import type { AgentTool } from '../base'

import { INFO_CONTACT, ORDER_STATUS } from '@/constants/app'
import { TOOL_NAME } from '@/constants/tools'
import { mockBranches, mockOrders } from '@/services/mockData'

const statusLabel = (status: string): string => {
  switch (status) {
    case ORDER_STATUS.CREATED:
      return 'Đã tạo đơn'
    case ORDER_STATUS.CONFIRMED:
      return 'Đã xác nhận'
    case ORDER_STATUS.PICKED_UP:
      return 'Đã nhận đồ'
    case ORDER_STATUS.WASHING:
      return 'Đang giặt'
    case ORDER_STATUS.DRYING:
      return 'Đang sấy'
    case ORDER_STATUS.IRONING:
      return 'Đang ủi'
    case ORDER_STATUS.FOLDING:
      return 'Đang gấp'
    case ORDER_STATUS.PACKAGING:
      return 'Đang đóng gói'
    case ORDER_STATUS.DELIVERING:
      return 'Đang giao hàng'
    case ORDER_STATUS.COMPLETED:
      return 'Đã hoàn thành'
    default:
      return status
  }
}

// Look up an order by its code or phone and summarize its progress
export const trackOrderTool: AgentTool = {
  name: TOOL_NAME.trackOrder,
  description: 'Track a laundry order by its order code or phone number.',
  parameters: {
    type: 'object',
    properties: {
      orderCode: {
        type: 'string',
        description: 'Order code, e.g. "GS100001".',
      },
      phone: {
        type: 'string',
        description: 'Optional phone number used when the order code is unknown.',
      },
    },
    required: [],
  },
  execute: async (args) => {
    const code = String(args?.orderCode ?? '')
      .trim()
      .toUpperCase()
    const phone = String(args?.phone ?? '').trim()

    const order = mockOrders.find((o) => (code && o.code.toUpperCase() === code) || (phone && o.phone === phone))

    if (!order) return `Không tìm thấy đơn hàng nào cho "${args?.orderCode || args?.phone}".`

    return [
      `Đơn ${order.code}: ${statusLabel(order.status)}`,
      `Dịch vụ: ${order.service} - ${order.weight}kg`,
      `Tổng tiền: ${order.totalPrice.toLocaleString('vi-VN')}đ`,
      `Dự kiến giao lúc: ${order.estimateDeliveryTime}`,
    ].join('\n')
  },
}

// Contact details of the shop
export const getContactInfoTool: AgentTool = {
  name: TOOL_NAME.getContactInfo,
  description: 'Get the shop contact information (phone, email, address, social links).',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const phone = INFO_CONTACT.Phone.replace('+84', '0').replace(/-/g, '')

    return [
      `Điện thoại: ${phone}`,
      `Email: ${INFO_CONTACT.Mail.replace('mailto:', '')}`,
      `Địa chỉ: ${INFO_CONTACT.Address}`,
      `Facebook: ${INFO_CONTACT.Facebook}`,
      `Zalo: ${INFO_CONTACT.Zalo}`,
    ].join('\n')
  },
}

// List laundry branches
export const getBranchesTool: AgentTool = {
  name: TOOL_NAME.getBranches,
  description: 'List the laundry branches with address and working hours.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    return mockBranches.map((b) => `- ${b.name}: ${b.address} (${b.workingHours}) - ${b.phone}`).join('\n')
  },
}
