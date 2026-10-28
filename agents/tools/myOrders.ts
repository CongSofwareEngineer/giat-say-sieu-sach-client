import type { AgentContext, AgentTool } from '../base'

import { statusLabel } from './order'

import { CANCELLABLE_ORDER_STATUS, MAX_CHAT_ORDERS, PAGE_SIZE } from '@/constants/app'
import { TOOL_NAME } from '@/constants/tools'
import OrderService, { getOrderCode, normalizeOrderCode, OrderItem, PublicOrderItem } from '@/services/order'
import { formatPhoneToE164, isValidVnPhone } from '@/utils/phone'
import { translate } from '@/utils/language'

// Marker embedded in the agent's final reply so the client shows the phone
// input (guest users need a phone number to look their orders up)
export const ORDER_PHONE_FORM_MARKER = '[ORDER_PHONE_FORM]'

const formatDate = (value?: string): string => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')

// Fields shared by the account orders and the public lookup orders
type ListableOrder = Pick<OrderItem | PublicOrderItem, 'id' | 'code' | 'status' | 'finalAmount' | 'createdAt' | 'items'>

// One markdown block per order (bold code + bold status on their own lines),
// blocks separated by a blank line so each order renders as its own paragraph
export const formatOrderList = (orders: ListableOrder[]): string => {
  if (orders.length === 0) return translate('agent.order.myOrders.empty', {}, 'Bạn chưa có đơn hàng nào.')

  const blocks = orders.map((o) => {
    const code = getOrderCode(o)
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

export type PendingCancelOrder = { id: string; code: string }

// Order the cancel tool picked in the current turn. The chat reads it once the
// agent replies and opens the confirm modal, so only the user's click cancels.
let pendingCancelOrder: PendingCancelOrder | null = null

// Read and clear the order waiting for the user's confirmation
export const takePendingCancelOrder = (): PendingCancelOrder | null => {
  const order = pendingCancelOrder

  pendingCancelOrder = null

  return order
}

// Own order by code: public lookup for the id, then the "my order" endpoint (404 for other users)
const findOwnOrderByCode = async (code: string): Promise<OrderItem | undefined> => {
  const publicOrder = await OrderService.getOrderByCode(code).catch(() => undefined)

  if (!publicOrder) return undefined

  return OrderService.getMyOrder(publicOrder.id).catch(() => undefined)
}

const requestCancelConfirm = (order: OrderItem): string => {
  const code = getOrderCode(order)

  pendingCancelOrder = { id: order.id, code }

  return (
    `Order #${code} can be cancelled. The client now shows a confirm dialog; the order is only cancelled after the user clicks confirm there. ` +
    'Briefly tell the user to confirm the cancellation in the dialog. Do not say the order is already cancelled.'
  )
}

// Cancel a just-placed order of the logged-in user (asks for confirmation in the UI)
export const cancelMyOrderTool: AgentTool = {
  name: TOOL_NAME.cancelMyOrder,
  description:
    'Start cancelling one of the logged in user own orders that is still waiting for confirmation. Use when the user asks to cancel an order ("huỷ đơn", "cancel my order"). The user confirms in a dialog, never cancel twice.',
  parameters: {
    type: 'object',
    properties: {
      orderCode: {
        type: 'string',
        description: 'Order code to cancel (8 characters, e.g. "K7QH3MZP"). Leave empty when the user did not give one.',
      },
    },
    required: [],
  },
  execute: async (args, ctx) => {
    // The cancel endpoint needs the owner's token, guests must call the shop
    if (!ctx?.userId) return translate('agent.order.cancel.requireLogin', {}, 'Bạn cần đăng nhập để huỷ đơn qua chat.')

    const code = normalizeOrderCode(String(args?.orderCode ?? ''))

    if (code) {
      const order = await findOwnOrderByCode(code)

      if (!order) return translate('agent.order.cancel.notFound', { code }, `Không tìm thấy đơn #${code} trong tài khoản của bạn.`)

      if (order.status !== CANCELLABLE_ORDER_STATUS) {
        const status = statusLabel(order.status)

        return translate('agent.order.cancel.notCancellable', { code, status }, `Đơn #${code} đang ở trạng thái "${status}" nên không thể huỷ.`)
      }

      return requestCancelConfirm(order)
    }

    // No code: pick among the user's orders still waiting for confirmation
    const response = await OrderService.getMyOrders({ limit: PAGE_SIZE })
    const pending = (response.data ?? []).filter((o) => o.status === CANCELLABLE_ORDER_STATUS)

    if (pending.length === 0) return translate('agent.order.cancel.noPending', {}, 'Bạn không có đơn nào đang chờ xác nhận để huỷ.')

    if (pending.length === 1) return requestCancelConfirm(pending[0])

    const items = pending.map((o) => {
      const params = { code: getOrderCode(o), date: formatDate(o.createdAt), price: o.finalAmount.toLocaleString('vi-VN') }

      return translate('agent.order.cancel.pickItem', params, `- #${params.code} · ${params.date} · ${params.price}đ`)
    })

    return [
      translate('agent.order.cancel.pickOne', { count: pending.length }, `Bạn có ${pending.length} đơn đang chờ xác nhận, bạn muốn huỷ đơn nào?`),
      ...items,
    ].join('\n')
  },
}
