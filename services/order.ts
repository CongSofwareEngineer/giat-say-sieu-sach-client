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
  promotionId?: string
  promotionCode?: string
  notes?: string
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
  async getOrders(params?: { page?: number; limit?: number; status?: ORDER_STATUS; userId?: string; fromDate?: string; toDate?: string }): Promise<ListResponse> {
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

  async updateOrderStatus(id: string, status: ORDER_STATUS): Promise<OrderItem> {
    const response = await this.patch<{ data: OrderItem }>(`/${id}/status?status=${status}`, {}, { isUseAuth: true })

    return response.data
  }
}

const OrderService = new OrderApi('laundry-orders')

export default OrderService
