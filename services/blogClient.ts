import BaseAPI from '@/config/baseApi'

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
}

class BlogApi extends BaseAPI {
  async getPosts(params?: { page?: number; limit?: number; category?: string }): Promise<BlogPost[]> {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.category) query.set('category', params.category)

    const response = await this.get<{ data: BlogPost[] }>(query.toString() ? `?${query.toString()}` : '', { isUseAuth: false })

    return response?.data ?? []
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await this.get<{ data: BlogPost }>(`/slug/${slug}`, { isUseAuth: false })

    return response.data
  }
}

const BlogService = new BlogApi('blogs')

export default BlogService