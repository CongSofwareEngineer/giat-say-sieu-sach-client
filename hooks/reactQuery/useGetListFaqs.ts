import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import FaqService, { FaqItem } from '@/services/faq'

const useGetListFaqs = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<FaqItem[]>({
    queryKey: [QUERY_KEYS.getListFaqs],
    queryFn: () => FaqService.getFaqs(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    faqs: data || [],
    isLoading,
    isError,
    error,
    refetch,
  }
}

export default useGetListFaqs
