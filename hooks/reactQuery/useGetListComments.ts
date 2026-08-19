import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import CommentService, { CommentItem, CreateCommentPayload, UpdateCommentPayload, buildCommentReplies } from '@/services/comment'
import useUser from '@/hooks/useUser'

const useGetListComments = (serviceId?: string, categoryId?: string) => {
  const queryClient = useQueryClient()
  const { isLogin, user } = useUser()

  const { data, isLoading, isError, error, refetch } = useQuery<CommentItem[]>({
    queryKey: [QUERY_KEYS.getListComments, serviceId ?? '', categoryId ?? ''],
    queryFn: () => CommentService.getComments(serviceId ? { serviceId } : categoryId ? { categoryId } : undefined),
  })

  // Transform flat parentComment structure into nested replies for UI
  const comments: CommentItem[] = useMemo(() => {
    if (!data) return []

    return buildCommentReplies(data)
  }, [data])

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
      CommentService.createComment(
        {
          ...payload,
          userId: isLogin ? (user?.id ?? '') : '',
          name: user?.name,
          phone: user?.phone,
        },
        { isUseAuth: isLogin }
      ),
    onSuccess: refresh,
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

  const { mutateAsync: toggleVisibility, isPending: isTogglingVisibility } = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) => CommentService.toggleVisibility(id, isVisible),
    onSuccess: refresh,
  })

  return {
    comments,
    rawComments: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    createComment,
    updateComment,
    replyComment,
    deleteComment,
    toggleVisibility,
    isCreating,
    isUpdating,
    isReplying,
    isDeleting,
    isTogglingVisibility,
  }
}

export default useGetListComments
