import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import FaqService, { FaqItem, FaqPayload } from '@/services/faq'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

// Admin FAQ list + create / update / delete (each mutation refetches admin + public lists)
const useAdminFaqs = () => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

  const { data, isLoading } = useQuery<FaqItem[]>({
    queryKey: [QUERY_KEYS.getAdminFaqs],
    queryFn: () => FaqService.getAdminFaqs(),
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getAdminFaqs] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListFaqs] })
  }

  const onError = () => {
    toast({ message: translate('common.error'), type: 'error' })
  }

  const { mutateAsync: createFaq, isPending: isCreating } = useMutation({
    mutationFn: (payload: FaqPayload) => FaqService.createFaq(payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.faqs.created'), type: 'default' })
    },
    onError,
  })

  const { mutateAsync: updateFaq, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FaqPayload> }) => FaqService.updateFaq(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.faqs.updated'), type: 'default' })
    },
    onError,
  })

  const { mutateAsync: deleteFaq, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => FaqService.deleteFaq(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.faqs.deleted'), type: 'default' })
    },
    onError,
  })

  return {
    faqs: data ?? [],
    isLoading,
    createFaq,
    updateFaq,
    deleteFaq,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

export default useAdminFaqs
