import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import PricingService, { PricingPlan } from '@/services/pricing'

const useGetListPrice = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<PricingPlan[]>({
    queryKey: [QUERY_KEYS.getListPrice],
    queryFn: () => PricingService.getPlans(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    prices: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
  }
}

export default useGetListPrice
