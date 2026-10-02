import BaseAPI from '@/config/baseApi'
import { ORDER_STATUS } from '@/constants/app'

export type OrderItem = {
  id: string
  userId: string
  addressId?: string
  status: ORDER_STATUS
  totalAmount: number
  discountAmount?: number
  finalAmount: number
  // Parts of discountAmount: heavy-order discount and redeemed loyalty points
  weightDiscount?: number
  pointsUsed?: number
  pointsDiscount?: number
  promotionId?: string
  promotionCode?: string
  notes?: string
  address?: string
  district?: string
  city?: string
  items: OrderItemDetail[]
  createdAt: string
  updatedAt: string
}

export type OrderItemDetail = {
  categoryId: string
  categoryName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

// Mirrors CreateLaundryOrderDto of the server (login required, needed to redeem points)
export type CreateOrderPayload = {
  addressId?: string
  address?: string
  district?: string
  city?: string
  items: { categoryId: string; quantity: number }[]
  notes?: string
  usePoints?: boolean
}

// Mirrors CreateGuestOrderDto of the server (no login required)
export type CreateGuestOrderPayload = {
  phone: string
  name: string
  notificationToken?: string
  address: string
  district: string
  city: string
  items: { categoryId: string; quantity: number }[]
  notes?: string
}

// Public order view returned by the no-auth lookups (no address/notes/user)
export type PublicOrderItem = {
  id: string
  code: string
  status: ORDER_STATUS
  totalAmount?: number
  discountAmount?: number
  finalAmount: number
  items: { categoryName: string; quantity: number; subtotal: number }[]
  createdAt: string
}

// Short order code shown to customers (last 6 chars of the order ID)
export const getOrderCode = (id: string): string => id.slice(-6).toUpperCase()

// Normalize a code typed by the user ("#a1b2c3" -> "A1B2C3")
export const normalizeOrderCode = (code: string): string => code.trim().replace(/^#/, '').toUpperCase()

type ListResponse = {
  data: OrderItem[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class OrderApi extends BaseAPI {
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: ORDER_STATUS
    userId?: string
    fromDate?: string
    toDate?: string
  }): Promise<ListResponse> {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.status) query.set('status', params.status)
    if (params?.userId) query.set('userId', params.userId)
    if (params?.fromDate) query.set('fromDate', params.fromDate)
    if (params?.toDate) query.set('toDate', params.toDate)

    const response = await this.get<ListResponse>(query.toString() ? `?${query.toString()}` : '', { isUseAuth: true })

    return response
  }

  // Orders of the logged-in user, newest first
  async getMyOrders(params?: { page?: number; limit?: number }): Promise<ListResponse> {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    const response = await this.get<ListResponse>(`/me${query.toString() ? `?${query.toString()}` : ''}`, { isUseAuth: true })

    return response
  }

  // One order of the logged-in user (fails with 404 when the order belongs to someone else)
  async getMyOrder(id: string): Promise<OrderItem> {
    const response = await this.get<{ data: OrderItem }>(`/me/${id}`, { isUseAuth: true })

    return response.data
  }

  // Customer cancels their own order (server only allows PENDING)
  async cancelMyOrder(id: string): Promise<OrderItem> {
    const response = await this.patch<{ data: OrderItem }>(`/me/${id}/cancel`, {}, { isUseAuth: true })

    return response.data
  }

  // Admin replaces the order items (weight); server recalculates amounts and rejects once washing started
  async updateOrderItems(id: string, items: { categoryId: string; quantity: number }[]): Promise<OrderItem> {
    const response = await this.patch<{ data: OrderItem }>(`/${id}/items`, { items }, { isUseAuth: true })

    return response.data
  }

  async updateOrderStatus(id: string, status: ORDER_STATUS): Promise<OrderItem> {
    const response = await this.patch<{ data: OrderItem }>(`/${id}/status?status=${status}`, {}, { isUseAuth: true })

    return response.data
  }

  async updateOrder(id: string, payload: { status?: ORDER_STATUS; notes?: string }): Promise<OrderItem> {
    const response = await this.patch<{ data: OrderItem }>(`/${id}`, payload, { isUseAuth: true })

    return response.data
  }

  async deleteOrder(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`, { isUseAuth: true })
  }

  async createOrder(payload: CreateOrderPayload): Promise<OrderItem> {
    const response = await this.post<{ data: OrderItem }>('/', payload, { isUseAuth: true })

    return response.data
  }

  async createGuestOrder(payload: CreateGuestOrderPayload): Promise<OrderItem> {
    const response = await this.post<{ data: OrderItem }>('/guest', payload, { isUseAuth: false })

    return response.data
  }

  // Most recent orders of a phone number (public fields only)
  async lookupOrdersByPhone(payload: { phone: string; limit?: number }): Promise<PublicOrderItem[]> {
    const response = await this.post<{ data: PublicOrderItem[] }>('/guest/lookup', payload, { isUseAuth: false })

    return response.data ?? []
  }

  // One order by its short code or full ID (public fields only)
  async getOrderByCode(code: string): Promise<PublicOrderItem> {
    const response = await this.get<{ data: PublicOrderItem }>(`/lookup/${encodeURIComponent(code)}`, { isUseAuth: false })

    return response.data
  }
}

const OrderService = new OrderApi('laundry-orders')

export default OrderService
