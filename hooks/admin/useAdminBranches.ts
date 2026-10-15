import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import BranchService, { BranchItem, BranchPayload } from '@/services/branch'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

// Admin branch list + create / update / delete (each mutation refetches admin + public lists)
const useAdminBranches = () => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

  const { data, isLoading } = useQuery<BranchItem[]>({
    queryKey: [QUERY_KEYS.getAdminBranches],
    queryFn: () => BranchService.getAdminBranches(),
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getAdminBranches] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListBranches] })
  }

  const onError = () => {
    toast({ message: translate('common.error'), type: 'error' })
  }

  const { mutateAsync: createBranch, isPending: isCreating } = useMutation({
    mutationFn: (payload: BranchPayload) => BranchService.createBranch(payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.branches.created'), type: 'default' })
    },
    onError,
  })

  const { mutateAsync: updateBranch, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BranchPayload> }) => BranchService.updateBranch(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.branches.updated'), type: 'default' })
    },
    onError,
  })

  const { mutateAsync: deleteBranch, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => BranchService.deleteBranch(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.branches.deleted'), type: 'default' })
    },
    onError,
  })

  return {
    branches: data ?? [],
    isLoading,
    createBranch,
    updateBranch,
    deleteBranch,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

export default useAdminBranches
