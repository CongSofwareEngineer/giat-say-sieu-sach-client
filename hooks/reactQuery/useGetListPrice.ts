import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import { fetchPrices, PriceItem } from '@/services/price'

const useGetListPrice = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<PriceItem[]>({
    queryKey: [QUERY_KEYS.getListPrice],
    queryFn: fetchPrices,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
