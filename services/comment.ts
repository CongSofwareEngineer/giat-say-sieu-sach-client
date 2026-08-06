import BaseAPI from '@/config/baseApi'

// Canonical service list used to group reviews (matches pricing plans ids)
export const COMMENT_SERVICES = [
  { id: 'giat-thuong', name: 'Giặt Thường' },
  { id: 'giat-nhanh', name: 'Giặt Nhanh' },
  { id: 'giat-kho', name: 'Giặt Khô' },
  { id: 'ui', name: 'Ủi' },
  { id: 'giat-ui', name: 'Giặt + Ủi' },
] as const

export const getServiceName = (serviceId?: string) => COMMENT_SERVICES.find((s) => s.id === serviceId)?.name ?? ''

export type CommentReply = {
  id: string
  content: string
  adminName: string
  createdAt: string // ISO datetime
}

export type CommentItem = {
  id: string
  serviceId: string
  phone: string
  name: string
  title: string
  content: string
  images: string[]
  rating: number // 0-5 stars
  createdAt: string // ISO datetime
  userId?: string // id of the logged-in author, undefined for guest reviews
  replies?: CommentReply[] // shop/admin replies
}

export type CreateCommentPayload = {
  serviceId: string
  phone: string
  name: string
  title: string
  content: string
  images: string[]
  rating: number
  userId?: string
}

export type UpdateCommentPayload = {
  title: string
  content: string
  images: string[]
  rating: number
}

type ListResponse = { data: CommentItem[] }

class CommentApi extends BaseAPI {
  // Fetch reviews, optionally filtered by service
  async getComments(params?: { serviceId?: string }): Promise<CommentItem[]> {
    const query = new URLSearchParams()

    if (params?.serviceId) query.set('serviceId', params.serviceId)

    const response = await this.get<ListResponse>(query.toString() ? `?${query.toString()}` : '')

    return response.data
  }

  // Create a review; images are base64 data URLs already optimized client-side.
  // Guests post anonymously; logged-in users send userId and the backend ties the review to their account.
  async createComment(payload: CreateCommentPayload, options?: { isUseAuth?: boolean }): Promise<CommentItem> {
    const response = await this.post<{ data: CommentItem }>('', payload, { isUseAuth: options?.isUseAuth ?? false })

    return response.data
  }

  // Update a review (author only; backend enforces ownership)
  async updateComment(id: string, payload: UpdateCommentPayload): Promise<CommentItem> {
    const response = await this.put<{ data: CommentItem }>(`/${id}`, payload)

    return response.data
  }

  // Reply to a review (admin only; backend enforces role)
  async replyComment(id: string, content: string): Promise<CommentItem> {
    const response = await this.post<{ data: CommentItem }>(`/${id}/replies`, { content })

    return response.data
  }

  // Delete a review (author or admin; backend enforces permission)
  async deleteComment(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`)
  }
}

const CommentService = new CommentApi('comments')

export default CommentService
