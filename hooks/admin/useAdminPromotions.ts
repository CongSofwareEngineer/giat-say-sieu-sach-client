import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import PromotionService, { PromotionItem, PromotionPayload } from '@/services/promotion'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

// Admin promotion list + create / update / delete (each mutation refetches the list)
const useAdminPromotions = () => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

  const { data, isLoading } = useQuery<PromotionItem[]>({
    queryKey: [QUERY_KEYS.getListPromotions],
    queryFn: () => PromotionService.getAdminPromotions(),
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListPromotions] })
  }

  const onError = () => {
    toast({ message: translate('common.error'), type: 'error' })
  }

  const { mutateAsync: createPromotion, isPending: isCreating } = useMutation({
    mutationFn: (payload: PromotionPayload) => PromotionService.createPromotion(payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.promotions.created'), type: 'default' })
    },
    onError,
  })

  const { mutateAsync: updatePromotion, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PromotionPayload }) => PromotionService.updatePromotion(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.promotions.updated'), type: 'default' })
    },
    onError,
  })

  const { mutateAsync: deletePromotion, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => PromotionService.deletePromotion(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.promotions.deleted'), type: 'default' })
    },
    onError,
  })

  return {
    promotions: data ?? [],
    isLoading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

export default useAdminPromotions
