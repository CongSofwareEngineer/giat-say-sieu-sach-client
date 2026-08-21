import type { AgentTool } from '../base'

import { INFO_CONTACT, ORDER_STATUS } from '@/constants/app'
import { TOOL_NAME } from '@/constants/tools'
import OrderService, { OrderItem } from '@/services/order'
import BranchService from '@/services/branch'
import { translate } from '@/utils/language'

const statusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    [ORDER_STATUS.PENDING]: translate('agent.order.status.PENDING', {}, 'Chờ xác nhận'),
    [ORDER_STATUS.RECEIVED]: translate('agent.order.status.RECEIVED', {}, 'Đã nhận đồ'),
    [ORDER_STATUS.WASHING]: translate('agent.order.status.WASHING', {}, 'Đang giặt'),
    [ORDER_STATUS.DRYING]: translate('agent.order.status.DRYING', {}, 'Đang sấy'),
    [ORDER_STATUS.READY]: translate('agent.order.status.READY', {}, 'Đã sẵn sàng'),
    [ORDER_STATUS.COMPLETED]: translate('agent.order.status.COMPLETED', {}, 'Đã hoàn thành'),
    [ORDER_STATUS.CANCELLED]: translate('agent.order.status.CANCELLED', {}, 'Đã hủy'),
  }

  return statusMap[status] || status
}

// Look up an order by its code or phone and summarize its progress
export const trackOrderTool: AgentTool = {
  name: TOOL_NAME.trackOrder,
  description: 'Tra cứu đơn hàng giặt theo mã đơn hàng hoặc số điện thoại.',
  parameters: {
    type: 'object',
    properties: {
      orderCode: {
        type: 'string',
        description: 'Order code, e.g. "GS100001" or the last 6 chars of the order ID.',
      },
      phone: {
        type: 'string',
        description: 'Optional phone number used when the order code is unknown.',
      },
    },
    required: [],
  },
  execute: async (args, ctx) => {
    const code = String(args?.orderCode ?? '')
      .trim()
      .toUpperCase()
    const phone = String(args?.phone ?? '').trim()

    const params: Record<string, string> = { limit: '50' }

    if (ctx.userId) params.userId = ctx.userId

    const response = await OrderService.getOrders(params)
    const orders = response.data ?? []

    let order: OrderItem | undefined

    if (code) {
      order = orders.find((o) => o.id.slice(-6).toUpperCase() === code)
    } else if (phone) {
      return translate('agent.order.track.noCode', {}, 'Vui lòng cung cấp mã đơn hàng để tra cứu. Mã đơn hàng có dạng GSxxxxxx.')
    }

    if (!order)
      return translate(
        'agent.order.track.notFound',
        { code: String(args?.orderCode || args?.phone) },
        `Không tìm thấy đơn hàng nào cho "${args?.orderCode || args?.phone}".`
      )

    const serviceNames = order.items?.map((item) => item.categoryName).join(', ') || '—'

    return translate(
      'agent.order.track.summary',
      {
        code: order.id.slice(-6).toUpperCase(),
        status: statusLabel(order.status),
        services: serviceNames,
        price: order.finalAmount.toLocaleString('vi-VN'),
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—',
      },
      [
        `Đơn #${order.id.slice(-6).toUpperCase()}: ${statusLabel(order.status)}`,
        `Dịch vụ: ${serviceNames}`,
        `Tổng tiền: ${order.finalAmount.toLocaleString('vi-VN')}đ`,
        `Ngày tạo: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}`,
      ].join('\n')
    )
  },
}

// Contact details of the shop
export const getContactInfoTool: AgentTool = {
  name: TOOL_NAME.getContactInfo,
  description: 'Lấy thông tin liên hệ của cửa hàng (số điện thoại, email, địa chỉ, mạng xã hội).',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const phone = INFO_CONTACT.Phone.replace('+84', '0').replace(/-/g, '')

    return translate(
      'agent.order.contact.summary',
      {
        phone,
        email: INFO_CONTACT.Mail.replace('mailto:', ''),
        address: INFO_CONTACT.Address,
        facebook: INFO_CONTACT.Facebook,
        zalo: INFO_CONTACT.Zalo,
      },
      [
        `Điện thoại: ${phone}`,
        `Email: ${INFO_CONTACT.Mail.replace('mailto:', '')}`,
        `Địa chỉ: ${INFO_CONTACT.Address}`,
        `Facebook: ${INFO_CONTACT.Facebook}`,
        `Zalo: ${INFO_CONTACT.Zalo}`,
      ].join('\n')
    )
  },
}

// List laundry branches
export const getBranchesTool: AgentTool = {
  name: TOOL_NAME.getBranches,
  description: 'Liệt kê các chi nhánh giặt với địa chỉ và giờ làm việc.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const branches = await BranchService.getBranches()
    const noHours = translate('agent.order.branch.noHours', {}, 'Không có giờ')

    return branches.map((b) => `- ${b.name}: ${b.address} (${b.workingHours || noHours}) - ${b.phone || '—'}`).join('\n')
  },
}
