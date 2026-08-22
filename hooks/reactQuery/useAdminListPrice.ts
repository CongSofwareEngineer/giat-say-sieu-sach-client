import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import PricingService, { PricingPlan, UpdatePricingPlanPayload, CreatePricingPlanPayload } from '@/services/pricing'

const useAdminListPrice = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery<PricingPlan[]>({
    queryKey: [QUERY_KEYS.getListPrice],
    queryFn: () => PricingService.getPlans(),
    staleTime: 5 * 60 * 1000,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListPrice] })
  }

  const { mutateAsync: createPlan, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreatePricingPlanPayload) => PricingService.createPlan(payload),
    onSuccess: refresh,
  })

  const { mutateAsync: deletePlan, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => PricingService.deletePlan(id),
    onSuccess: refresh,
  })

  const { mutateAsync: updatePlan, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePricingPlanPayload }) => PricingService.updatePlan(id, payload),
    onSuccess: refresh,
  })

  return {
    prices: data || [],
    isLoading,
    isError,
    error,
    refetch,
    createPlan,
    deletePlan,
    updatePlan,
    isCreating,
    isDeleting,
    isUpdating,
  }
}

export default useAdminListPrice
