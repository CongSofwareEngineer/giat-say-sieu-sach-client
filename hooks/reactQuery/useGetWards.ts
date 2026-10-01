import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import LocationService from '@/services/location'
import { District } from '@/services/location/type'

// Wards (phường/xã) of a province, only fetched once a province is chosen
const useGetWards = (provinceId?: string) => {
  const { data, isLoading, isError, error, refetch } = useQuery<District[]>({
    queryKey: [QUERY_KEYS.getWards, provinceId],
    queryFn: () => LocationService.getDistricts(Number(provinceId)),
    enabled: !!provinceId,
    staleTime: Infinity,
  })

  return {
    wards: data || [],
    isLoading,
    isError,
    error,
    refetch,
  }
}

export default useGetWards
