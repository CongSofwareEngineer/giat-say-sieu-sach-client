import { useMemo, useState } from 'react'

import useGetListComments from '@/hooks/reactQuery/useGetListComments'
import useUser from '@/hooks/useUser'

const PAGE_SIZE = 10

const useAdminListComments = () => {
  const { isLogin, user } = useUser()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  const [page, setPage] = useState(1)

  const {
    rawComments,
    isLoading,
    refetch,
    toggleVisibility,
    isTogglingVisibility,
    deleteComment,
    isDeleting,
    replyComment,
    isReplying,
    adminDeleteComment,
    isAdminDeleting,
  } = useGetListComments()

  const isAdmin = isLogin && !!user?.isAdmin

  const filteredComments = useMemo(() => {
    const kw = keyword.trim().toLowerCase()

    return rawComments.filter((comment) => {
      const matchKeyword =
        !kw ||
        comment.content?.toLowerCase().includes(kw) ||
        comment.name?.toLowerCase().includes(kw) ||
        comment.phone?.includes(kw) ||
        comment.id?.toLowerCase().includes(kw)

      const matchStatus = statusFilter === 'all' || (statusFilter === 'visible' ? comment.isVisible : !comment.isVisible)

      return matchKeyword && matchStatus
    })
  }, [rawComments, keyword, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredComments.length / PAGE_SIZE))
  const paginatedComments = filteredComments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetPage = () => setPage(1)

  return {
    comments: paginatedComments,
    allComments: rawComments,
    totalComments: filteredComments.length,
    isLoading,
    refetch,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    resetPage,
    isAdmin,
    toggleVisibility,
    isTogglingVisibility,
    deleteComment: adminDeleteComment,
    isDeleting: isAdminDeleting,
    replyComment,
    isReplying,
  }
}

export default useAdminListComments
