import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import LocationService from '@/services/location'
import Province from '@/services/location/type'

const CACHE_KEY = 'location_provinces_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000

const getCachedProvinces = (): { data: Province[]; timestamp: number } | null => {
  if (typeof window === 'undefined') return null

  const cached = localStorage.getItem(CACHE_KEY)

  if (!cached) return null

  try {
    const parsed = JSON.parse(cached) as { data: Province[]; timestamp: number }

    return parsed
  } catch {
    return null
  }
}

const setCachedProvinces = (data: Province[]): void => {
  if (typeof window === 'undefined') return

  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION
}

const useGetProvinces = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<Province[]>({
    queryKey: [QUERY_KEYS.getProvinces],
    queryFn: async () => {
      const cached = getCachedProvinces()

      if (cached && isCacheValid(cached.timestamp)) {
        return cached.data
      }

      const provinces = await LocationService.getProvinces()

      setCachedProvinces(provinces)

      return provinces
    },
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION,
  })

  return {
    provinces: data || [],
    isLoading,
    isError,
    error,
    refetch,
  }
}

export default useGetProvinces
