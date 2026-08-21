import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import CommentService, { CommentItem, UpdateCommentPayload } from '@/services/comment'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

type AdminCommentsParams = {
  page?: number
  limit?: number
  isVisible?: boolean
}

const useAdminComments = (params?: AdminCommentsParams) => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

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
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.comments.toggled', {}, 'Cập nhật trạng thái đánh giá thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: replyToComment, isPending: isReplying } = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => CommentService.replyComment(id, content),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.comments.replied', {}, 'Phản hồi đánh giá thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: adminUpdateComment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCommentPayload }) => CommentService.adminUpdateComment(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.comments.updated', {}, 'Cập nhật đánh giá thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: adminDeleteComment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => CommentService.adminDeleteComment(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.comments.deleted', {}, 'Xóa đánh giá thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
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
