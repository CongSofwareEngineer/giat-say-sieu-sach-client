import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import CommentService, { CommentItem, UpdateCommentPayload } from '@/services/comment'

type AdminCommentsParams = {
  page?: number
  limit?: number
  isVisible?: boolean
}

const useAdminComments = (params?: AdminCommentsParams) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery<{ data: CommentItem[]; meta: any }>({
    queryKey: [QUERY_KEYS.getListComments, params ?? {}],
    queryFn: () => CommentService.getComments(undefined, { page: params?.page, limit: params?.limit, isVisible: params?.isVisible }),
    staleTime: 30_000,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListComments] })
  }

  const { mutateAsync: toggleVisibility, isPending: isTogglingVisibility } = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) => CommentService.toggleVisibility(id, isVisible),
    onSuccess: refresh,
  })

  const { mutateAsync: replyToComment, isPending: isReplying } = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => CommentService.replyComment(id, content),
    onSuccess: refresh,
  })

  const { mutateAsync: adminUpdateComment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCommentPayload }) => CommentService.adminUpdateComment(id, payload),
    onSuccess: refresh,
  })

  const { mutateAsync: adminDeleteComment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => CommentService.adminDeleteComment(id),
    onSuccess: refresh,
  })

  return {
    comments: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
    toggleVisibility,
    replyToComment,
    adminUpdateComment,
    adminDeleteComment,
    isTogglingVisibility,
    isReplying,
    isUpdating,
    isDeleting,
  }
}

export default useAdminComments
