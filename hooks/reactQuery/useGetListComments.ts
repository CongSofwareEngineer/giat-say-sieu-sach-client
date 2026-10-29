import { useMemo } from 'react'
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import CommentService, { CommentItem, CreateCommentPayload, UpdateCommentPayload, buildCommentReplies } from '@/services/comment'
import useUser from '@/hooks/useUser'
import { CloudinaryImage } from '@/services/upload'

const useGetListComments = (serviceId?: string, categoryId?: string) => {
  const queryClient = useQueryClient()
  const { isLogin, user } = useUser()
  const isAdmin = isLogin && user?.role === 'ADMIN'

  const effectiveCategoryId = categoryId || serviceId

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.getListComments, serviceId ?? '', categoryId ?? ''],
    queryFn: ({ pageParam }) => {
      if (!effectiveCategoryId && !isAdmin) {
        return Promise.resolve({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } })
      }

      return CommentService.getComments(effectiveCategoryId, { page: pageParam as number })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.page != null && lastPage.meta?.totalPages != null && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1
      }

      return undefined
    },
  })

  const pages = data?.pages ?? []
  const meta = pages[pages.length - 1]?.meta

  const allComments = useMemo(() => pages.flatMap((page) => page.data), [pages])

  const comments: CommentItem[] = useMemo(() => {
    return buildCommentReplies(allComments)
  }, [allComments])

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListComments] })
  }

  const { mutateAsync: createComment, isPending: isCreating } = useMutation({
    mutationFn: (
      payload: Omit<CreateCommentPayload, 'userId'> & {
        serviceId?: string
        categoryId?: string
      }
    ) =>
      CommentService.createComment(payload.categoryId || payload.serviceId || '', {
        rating: payload.rating ?? 0,
        title: payload.title,
        content: payload.content,
        images: payload.images,
      }),
    onSuccess: refresh,
  })

  const { mutateAsync: createOrderComment, isPending: isCreatingOrderComment } = useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string
      payload: { rating: number; title?: string; content: string; images: CloudinaryImage[] }
    }) => CommentService.createOrderComment(orderId, payload),
    onSuccess: () => {
      refresh()
      // "My orders" shows the review button until the order is reviewed
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getMyOrders] })
    },
  })

  const { mutateAsync: updateComment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCommentPayload }) => CommentService.updateComment(id, payload),
    onSuccess: refresh,
  })

  const { mutateAsync: replyComment, isPending: isReplying } = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => CommentService.replyComment(id, content),
    onSuccess: refresh,
  })

  const { mutateAsync: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => CommentService.deleteComment(id),
    onSuccess: refresh,
  })

  const { mutateAsync: adminDeleteComment, isPending: isAdminDeleting } = useMutation({
    mutationFn: (id: string) => CommentService.adminDeleteComment(id),
    onSuccess: refresh,
  })

  const { mutateAsync: adminUpdateComment, isPending: isAdminUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCommentPayload }) => CommentService.adminUpdateComment(id, payload),
    onSuccess: refresh,
  })

  const { mutateAsync: toggleVisibility, isPending: isTogglingVisibility } = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) => CommentService.toggleVisibility(id, isVisible),
    onSuccess: refresh,
  })

  return {
    comments,
    rawComments: allComments,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    meta,
    createComment,
    createOrderComment,
    updateComment,
    replyComment,
    deleteComment,
    adminDeleteComment,
    adminUpdateComment,
    toggleVisibility,
    isCreating,
    isCreatingOrderComment,
    isUpdating,
    isReplying,
    isDeleting,
    isAdminDeleting,
    isAdminUpdating,
    isTogglingVisibility,
  }
}

export default useGetListComments
