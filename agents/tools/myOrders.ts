import type { AgentContext, AgentTool } from '../base'

import { statusLabel } from './order'

import { MAX_CHAT_ORDERS } from '@/constants/app'
import { TOOL_NAME } from '@/constants/tools'
import OrderService, { getOrderCode, OrderItem, PublicOrderItem } from '@/services/order'
import { formatPhoneToE164, isValidVnPhone } from '@/utils/phone'
import { translate } from '@/utils/language'

// Marker embedded in the agent's final reply so the client shows the phone
// input (guest users need a phone number to look their orders up)
export const ORDER_PHONE_FORM_MARKER = '[ORDER_PHONE_FORM]'

const formatDate = (value?: string): string => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')

// Fields shared by the account orders and the public lookup orders
type ListableOrder = Pick<OrderItem | PublicOrderItem, 'id' | 'status' | 'finalAmount' | 'createdAt' | 'items'>

// One markdown block per order (bold code + bold status on their own lines),
// blocks separated by a blank line so each order renders as its own paragraph
export const formatOrderList = (orders: ListableOrder[]): string => {
  if (orders.length === 0) return translate('agent.order.myOrders.empty', {}, 'Bạn chưa có đơn hàng nào.')

  const blocks = orders.map((o) => {
    const code = getOrderCode(o.id)
    const status = statusLabel(o.status)
    const services = o.items?.map((item) => `${item.categoryName} (${item.quantity} kg)`).join(', ') || '—'
    const price = o.finalAmount.toLocaleString('vi-VN')
    const date = formatDate(o.createdAt)

    return translate(
      'agent.order.myOrders.item',
      { code, status, services, price, date },
      `**Đơn #${code}**\nTình trạng: **${status}**\nDịch vụ: ${services}\nTổng tiền: ${price}đ · Ngày đặt: ${date}`
    )
  })

  return [translate('agent.order.myOrders.header', { count: orders.length }, `${orders.length} đơn gần nhất của bạn:`), ...blocks].join('\n\n')
}

// Logged-in users: latest orders from their account
const fetchUserOrders = async (): Promise<OrderItem[]> => {
  const response = await OrderService.getMyOrders({ limit: MAX_CHAT_ORDERS })

  return (response.data ?? []).slice(0, MAX_CHAT_ORDERS)
}

// Guests: latest orders of the phone number they booked with
const fetchOrdersByPhone = async (phone: string): Promise<PublicOrderItem[]> =>
  OrderService.lookupOrdersByPhone({ phone: formatPhoneToE164(phone) ?? phone, limit: MAX_CHAT_ORDERS })

// Shared by the LLM tool call and the chat phone form
export const getMyOrders = async (phone: string | undefined, ctx: AgentContext): Promise<string> => {
  if (ctx.userId) return formatOrderList(await fetchUserOrders())

  if (!phone) {
    return (
      'The user is not logged in and has not given a phone number. Briefly ask them to enter the phone number they booked with, ' +
      `then end your reply with the exact marker ${ORDER_PHONE_FORM_MARKER} on its own line so the client shows the phone input.`
    )
  }

  if (!isValidVnPhone(phone)) return translate('agent.order.myOrders.invalidPhone', {}, 'Số điện thoại không hợp lệ.')

  return formatOrderList(await fetchOrdersByPhone(phone))
}

// Lists the user's most recent orders with their status
export const getMyOrdersTool: AgentTool = {
  name: TOOL_NAME.getMyOrders,
  description:
    'List the user\'s most recent laundry orders with their status. Use when the user asks about their own orders without a specific code (e.g. "đơn tôi đặt", "đơn hàng của tôi", "check đơn", "my orders").',
  parameters: {
    type: 'object',
    properties: {
      phone: {
        type: 'string',
        description: 'Phone number the guest booked with. Only pass it if the user already gave it in the conversation.',
      },
    },
    required: [],
  },
  execute: async (args, ctx) => getMyOrders(typeof args?.phone === 'string' ? args.phone.trim() : undefined, ctx),
}
