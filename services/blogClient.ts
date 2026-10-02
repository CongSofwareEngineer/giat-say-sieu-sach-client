import type { CloudinaryImage } from '@/services/upload'

import BaseAPI from '@/config/baseApi'
import { API_CACHE_SECONDS } from '@/constants/app'

export type BlogPost = {
  id: string
  title: string
  slug: string
  thumbnail: CloudinaryImage | null
  excerpt: string
  content: string
  category: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author?: string | null
}

class BlogApi extends BaseAPI {
  async getPosts(params?: { page?: number; limit?: number; category?: string }): Promise<BlogPost[]> {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.category) query.set('category', params.category)

    // Cached on the Next server (ignored in the browser)
    const response = await this.get<{ data: BlogPost[] }>(query.toString() ? `?${query.toString()}` : '', {
      isUseAuth: false,
      next: { revalidate: API_CACHE_SECONDS },
    })

    return response?.data ?? []
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    // Cached on the Next server (ignored in the browser)
    const response = await this.get<{ data: BlogPost }>(`/slug/${slug}`, { isUseAuth: false, next: { revalidate: API_CACHE_SECONDS } })

    return response.data
  }
}

const BlogService = new BlogApi('blogs')

export default BlogService
