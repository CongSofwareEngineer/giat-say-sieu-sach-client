import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import BranchService, { BranchItem } from '@/services/branch'

const useGetListBranches = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<BranchItem[]>({
    queryKey: [QUERY_KEYS.getListBranches],
    queryFn: () => BranchService.getBranches(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    branches: data || [],
    isLoading,
    isError,
    error,
    refetch,
  }
}

export default useGetListBranches
