import type { AgentTool } from '../base'

import { BRANCH_SOCIAL, INFO_CONTACT, ORDER_STATUS } from '@/constants/app'
import { TOOL_NAME } from '@/constants/tools'
import OrderService, { getOrderCode, normalizeOrderCode, PublicOrderItem } from '@/services/order'
import BranchService from '@/services/branch'
import { formatAddress } from '@/services/address'
import { translate } from '@/utils/language'

export const statusLabel = (status: string): string => {
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

// Look up one order by its code (public API, no login needed) and summarize its progress
export const trackOrderTool: AgentTool = {
  name: TOOL_NAME.trackOrder,
  description: 'Track one laundry order by its order code. Use get_my_orders instead when the user only gives a phone number.',
  parameters: {
    type: 'object',
    properties: {
      orderCode: {
        type: 'string',
        description: 'Order code shown after booking: 8 characters, e.g. "K7QH3MZP" or "#K7QH3MZP".',
      },
      phone: {
        type: 'string',
        description: 'Optional phone number used when the order code is unknown.',
      },
    },
    required: [],
  },
  execute: async (args) => {
    const code = normalizeOrderCode(String(args?.orderCode ?? ''))
    const phone = String(args?.phone ?? '').trim()

    if (!code && phone) {
      return translate('agent.order.track.noCode', {}, 'Vui lòng cung cấp mã đơn hàng để tra cứu. Mã đơn hàng gồm 8 ký tự, dạng #XXXXXXXX.')
    }

    let order: PublicOrderItem | undefined

    if (code) {
      // Public lookup by random code, works with or without login
      order = await OrderService.getOrderByCode(code).catch(() => undefined)
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
        code: getOrderCode(order),
        status: statusLabel(order.status),
        services: serviceNames,
        price: order.finalAmount.toLocaleString('vi-VN'),
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—',
      },
      [
        `Đơn #${getOrderCode(order)}: ${statusLabel(order.status)}`,
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
  description: 'Get the shop contact information (phone, email, address, social links).',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const phone = INFO_CONTACT.Phone.replace('+84', '0').replace(/-/g, '')
    // Real shop addresses come from the branch API
    const branches = await BranchService.getBranches().catch(() => [])
    const address =
      branches.length > 0
        ? branches.map((b) => formatAddress(b)).join('; ')
        : translate('agent.order.branch.empty', {}, 'Hiện chưa có chi nhánh nào.')

    return translate(
      'agent.order.contact.summary',
      {
        phone,
        email: INFO_CONTACT.Mail.replace('mailto:', ''),
        address,
        facebook: INFO_CONTACT.Facebook,
        zalo: INFO_CONTACT.Zalo,
      },
      [
        `Điện thoại: ${phone}`,
        `Email: ${INFO_CONTACT.Mail.replace('mailto:', '')}`,
        `Địa chỉ: ${address}`,
        `Facebook: ${INFO_CONTACT.Facebook}`,
        `Zalo: ${INFO_CONTACT.Zalo}`,
      ].join('\n')
    )
  },
}

// List laundry branches
export const getBranchesTool: AgentTool = {
  name: TOOL_NAME.getBranches,
  description:
    'List the shop laundry branches (store addresses / locations) with working hours, phone and map link. Use it whenever the user asks for the shop address ("địa chỉ", "chi nhánh", "cửa hàng ở đâu").',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const branches = await BranchService.getBranches()

    if (branches.length === 0) return translate('agent.order.branch.empty', {}, 'Hiện chưa có chi nhánh nào.')

    const noHours = translate('agent.order.branch.noHours', {}, 'Không có giờ')

    return branches
      .map((b) => {
        const line = `- **${b.name}**: ${formatAddress(b)} (${b.openingHours || noHours}) - ${b.phone || '—'}`
        const mapUrl = b.socialMedia?.[BRANCH_SOCIAL.GOOGLE_MAP]

        return mapUrl ? `${line}\n  ${translate('agent.order.branch.map', { url: mapUrl }, `Bản đồ: ${mapUrl}`)}` : line
      })
      .join('\n')
  },
}
