import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import BlogService, { BlogPost, CreateBlogPayload, UpdateBlogPayload } from '@/services/blog'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

type AdminBlogParams = {
  page?: number
  limit?: number
  search?: string
  category?: string
  isPublished?: boolean
}

const useAdminBlog = (params?: AdminBlogParams) => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

  const { data, isLoading, isError, error, refetch } = useQuery<BlogPost[]>({
    queryKey: [QUERY_KEYS.getListBlogs, params ?? {}],
    queryFn: async () => {
      const posts = await BlogService.getPosts(params)

      return posts
    },
    staleTime: 30_000,
  })

  const getPostById = async (id: string): Promise<BlogPost> => {
    return await BlogService.getPostById(id)
  }

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListBlogs] })
  }

  const { mutateAsync: createPost, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateBlogPayload) => BlogService.createPost(payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.blog.created', {}, 'Thêm bài viết thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: updatePost, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBlogPayload }) => BlogService.updatePost(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.blog.updated', {}, 'Cập nhật bài viết thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => BlogService.deletePost(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.blog.deleted', {}, 'Xóa bài viết thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  return {
    posts: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    createPost,
    updatePost,
    deletePost,
    getPostById,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

export default useAdminBlog