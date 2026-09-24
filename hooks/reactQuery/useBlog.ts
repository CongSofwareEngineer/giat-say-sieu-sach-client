import { useQuery } from '@tanstack/react-query'

import BlogService, { BlogPost } from '@/services/blogClient'
import { QUERY_KEYS } from '@/constants/reactQuery'

type BlogParams = {
  page?: number
  limit?: number
  category?: string
}

export const useBlogPosts = (params?: BlogParams) => {
  return useQuery<BlogPost[]>({
    queryKey: [QUERY_KEYS.getListBlogs, params ?? {}],
    queryFn: () => BlogService.getPosts(params),
    staleTime: 60_000,
  })
}

export const useBlogPost = (slug: string) => {
  return useQuery<BlogPost>({
    queryKey: [QUERY_KEYS.getListBlogs, slug],
    queryFn: () => BlogService.getPostBySlug(slug),
    staleTime: 60_000,
    enabled: !!slug,
  })
}