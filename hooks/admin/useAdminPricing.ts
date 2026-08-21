import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import { LANGUAGE_SUPPORT } from '@/zustand/language'
import PricingService, { PricingPlan } from '@/services/pricing'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

type AdminPricingParams = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  popular?: boolean
}

type CreatePricingPayload = {
  name: string
  description?: string
  features?: Record<LANGUAGE_SUPPORT, string[]>
  unit?: string
  price: number
  popular?: boolean
}

type UpdatePricingPayload = {
  name?: string
  description?: string
  unit?: string
  price?: number
  isActive?: boolean
  popular?: boolean
  features?: Record<LANGUAGE_SUPPORT, string[]>
}

const useAdminPricing = (params?: AdminPricingParams) => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

  const { data, isLoading, isError, error, refetch } = useQuery<PricingPlan[]>({
    queryKey: [QUERY_KEYS.getListPrice, params ?? {}],
    queryFn: async () => {
      const plans = await PricingService.getPlans()

      if (!params) return plans

      return plans.filter((plan) => {
        if (params.search && !plan.name.toLowerCase().includes(params.search!.toLowerCase())) return false
        if (params.isActive !== undefined && plan.isActive !== params.isActive) return false
        if (params.popular !== undefined && plan.popular !== params.popular) return false

        return true
      })
    },
    staleTime: 30_000,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListPrice] })
  }

  const { mutateAsync: createPlan, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreatePricingPayload) => PricingService.createPlan(payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.prices.created', {}, 'Thêm dịch vụ thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: updatePlan, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePricingPayload }) => PricingService.updatePlan(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.prices.updated', {}, 'Cập nhật dịch vụ thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: deletePlan, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => PricingService.deletePlan(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.prices.deleted', {}, 'Xóa dịch vụ thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  return {
    plans: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    createPlan,
    updatePlan,
    deletePlan,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

export default useAdminPricing
