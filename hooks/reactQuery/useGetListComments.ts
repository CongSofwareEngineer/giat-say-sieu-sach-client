import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import CommentService, { CommentItem, CreateCommentPayload, UpdateCommentPayload } from '@/services/comment'
import useUser from '@/hooks/useUser'

const useGetListComments = (serviceId?: string) => {
  const queryClient = useQueryClient()
  const { isLogin, user } = useUser()

  const { data, isLoading, isError, error, refetch } = useQuery<CommentItem[]>({
    queryKey: [QUERY_KEYS.getListComments, serviceId ?? ''],
    queryFn: () => CommentService.getComments(serviceId ? { serviceId } : undefined),
  })

  // Invalidate both the filtered and the full list after any mutation
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListComments] })
  }

  const { mutateAsync: createComment, isPending: isCreating } = useMutation({
    // Logged-in users create reviews tied to their account; guests post anonymously
    mutationFn: (payload: CreateCommentPayload) =>
      CommentService.createComment(isLogin ? { ...payload, userId: user?.id } : payload, { isUseAuth: isLogin }),
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

  return {
    comments: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    createComment,
    updateComment,
    replyComment,
    deleteComment,
    isCreating,
    isUpdating,
    isReplying,
    isDeleting,
  }
}

export default useGetListComments
