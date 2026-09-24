import BaseAPI from '@/config/baseApi'
import { LANGUAGE_SUPPORT } from '@/zustand/language'

export type BlogPost = {
  id: string
  title: string
  slug: string
  thumbnail: string
  excerpt: string
  content: string
  category: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author?: string | null
}

export type CreateBlogPayload = {
  title: string
  slug: string
  thumbnail?: string
  excerpt?: string
  content: string
  category: string
  isPublished?: boolean
}

export type UpdateBlogPayload = {
  title?: string
  slug?: string
  thumbnail?: string
  excerpt?: string
  content?: string
  category?: string
  isPublished?: boolean
}

class BlogApi extends BaseAPI {
  async getPosts(params?: { page?: number; limit?: number; search?: string; category?: string; isPublished?: boolean }): Promise<BlogPost[]> {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.search) query.set('search', params.search)
    if (params?.category) query.set('category', params.category)
    if (params?.isPublished !== undefined) query.set('isPublished', String(params.isPublished))

    const response = await this.get<{ data: BlogPost[] }>(query.toString() ? `?${query.toString()}` : '')

    return response?.data ?? []
  }

  async getPostById(id: string): Promise<BlogPost> {
    const response = await this.get<{ data: BlogPost }>(`/${id}`)

    return response.data
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await this.get<{ data: BlogPost }>(`/slug/${slug}`, { isUseAuth: false })

    return response.data
  }

  async createPost(payload: CreateBlogPayload): Promise<BlogPost> {
    const response = await this.post<{ data: BlogPost }>('', payload, { isUseAuth: true })

    return response.data
  }

  async updatePost(id: string, payload: UpdateBlogPayload): Promise<BlogPost> {
    const response = await this.patch<{ data: BlogPost }>(`/${id}`, payload, { isUseAuth: true })

    return response.data
  }

  async deletePost(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`, { isUseAuth: true })
  }
}

const BlogService = new BlogApi('blogs')

export default BlogService