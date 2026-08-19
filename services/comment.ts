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

type ListResponse = { data: CommentItem[] }

// Recursively filter out hidden comments and their replies
export const filterVisibleComments = (comments: CommentItem[]): CommentItem[] => {
  return comments
    .filter((comment) => comment.isVisible !== false)
    .map((comment) => ({
      ...comment,
      replies: comment.replies?.length ? filterVisibleComments(comment.replies) : [],
    }))
}

// Build nested replies from flat parentComment structure
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
  async getComments(params?: { serviceId?: string; categoryId?: string }): Promise<CommentItem[]> {
    const query = new URLSearchParams()

    if (params?.serviceId) query.set('serviceId', params.serviceId)
    if (params?.categoryId) query.set('categoryId', params.categoryId)

    const response = await this.get<ListResponse>(query.toString() ? `?${query.toString()}` : '')

    return response.data
  }

  async createComment(payload: CreateCommentPayload, options?: { isUseAuth?: boolean }): Promise<CommentItem> {
    const response = await this.post<{ data: CommentItem }>('', payload, { isUseAuth: options?.isUseAuth ?? false })

    return response.data
  }

  async updateComment(id: string, payload: UpdateCommentPayload): Promise<CommentItem> {
    const response = await this.put<{ data: CommentItem }>(`/${id}`, payload)

    return response.data
  }

  async replyComment(id: string, content: string): Promise<CommentItem> {
    const response = await this.post<{ data: CommentItem }>(`/${id}/reply`, { content })

    return response.data
  }

  async deleteComment(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`)
  }

  async toggleVisibility(id: string, isVisible: boolean): Promise<CommentItem> {
    const response = await this.patch<{ data: CommentItem }>(`/${id}/visibility`, { isVisible })

    return response.data
  }
}

const CommentService = new CommentApi('comments/laundry-categories')

export default CommentService
