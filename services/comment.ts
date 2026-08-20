import BaseAPI from '@/config/baseApi'

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
  createdAt: string
}

export type CommentItem = {
  id: string
  userId: string
  categoryId?: string
  rating?: number
  content: string
  isVisible: boolean
  images: string[]
  parentComment: string | null
  createdAt: string
  name?: string
  phone?: string
  title?: string
  serviceId?: string
  replies?: CommentItem[]
}

export type CreateCommentPayload = {
  userId: string
  categoryId?: string
  rating?: number
  content: string
  images: string[]
  parentComment?: string | null
  name?: string
  phone?: string
  title?: string
  serviceId?: string
}

export type UpdateCommentPayload = {
  userId?: string
  categoryId?: string
  rating?: number
  content?: string
  images?: string[]
  isVisible?: boolean
  parentComment?: string | null
  name?: string
  phone?: string
  title?: string
  serviceId?: string
}

type ListResponse = {
  data: CommentItem[]
  meta: {
    page: number | null
    limit: number | null
    total: number
    totalPages: number | null
  }
}

export const filterVisibleComments = (comments: CommentItem[]): CommentItem[] => {
  return comments
    .filter((comment) => comment.isVisible !== false)
    .map((comment) => ({
      ...comment,
      replies: comment.replies?.length ? filterVisibleComments(comment.replies) : [],
    }))
}

export const buildCommentReplies = (comments: CommentItem[]): CommentItem[] => {
  const map = new Map<string, CommentItem>()
  const roots: CommentItem[] = []

  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] })
  })

  comments.forEach((comment) => {
    const node = map.get(comment.id)!

    if (comment.parentComment && map.has(comment.parentComment)) {
      const parent = map.get(comment.parentComment)!

      if (!parent.replies) parent.replies = []

      parent.replies.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

class CommentApi extends BaseAPI {
  async getComments(categoryId?: string, params?: { page?: number; limit?: number }): Promise<{ data: CommentItem[]; meta: ListResponse['meta'] }> {
    let url = ''
    let options: { isUseAuth?: boolean } = {}

    if (categoryId) {
      const query = new URLSearchParams()

      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))

      url = `/laundry-categories/${categoryId}${query.toString() ? `?${query.toString()}` : ''}`
    } else {
      const query = new URLSearchParams()

      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))

      url = query.toString() ? `?${query.toString()}` : ''
      options = { isUseAuth: true }
    }

    const response = await this.get<ListResponse>(url, options)

    return { data: response.data, meta: response.meta }
  }

  async createComment(categoryId: string, payload: { rating?: number; content: string; images: string[] }, options?: { isUseAuth?: boolean }): Promise<CommentItem> {
    const response = await this.post<{ data: CommentItem }>(`/laundry-categories/${categoryId}`, payload, { isUseAuth: options?.isUseAuth ?? false })

    return response.data
  }

  async updateComment(id: string, payload: UpdateCommentPayload): Promise<CommentItem> {
    const response = await this.patch<{ data: CommentItem }>(`/me/${id}`, payload, { isUseAuth: true })

    return response.data
  }

  async replyComment(id: string, content: string): Promise<CommentItem> {
    const response = await this.post<{ data: CommentItem }>(`/${id}/reply`, { content }, { isUseAuth: true })

    return response.data
  }

  async deleteComment(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/me/${id}`, { isUseAuth: true })
  }

  async toggleVisibility(id: string, isVisible: boolean): Promise<CommentItem> {
    const path = isVisible ? `/${id}/show` : `/${id}/hide`
    const response = await this.patch<{ data: CommentItem }>(path, {}, { isUseAuth: true })

    return response.data
  }
}

const CommentService = new CommentApi('comments')

export default CommentService
