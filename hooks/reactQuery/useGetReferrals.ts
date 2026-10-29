import { useQuery } from '@tanstack/react-query'

import { REFERRAL } from '@/constants/app'
import { QUERY_KEYS } from '@/constants/reactQuery'
import useUser from '@/hooks/useUser'
import ReferralService from '@/services/referral'

const STALE_TIME = 30_000

// My referral code + totals
export const useGetReferralSummary = () => {
  const { isLogin, user } = useUser()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.getReferralSummary, user?.id ?? ''],
    queryFn: () => ReferralService.getSummary(),
    enabled: isLogin && !!user?.id,
    staleTime: STALE_TIME,
  })

  return { summary: data, isLoading, isError, refetch }
}

// People I referred (paginated)
export const useGetReferees = (page: number = 1) => {
  const { isLogin, user } = useUser()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.getReferees, user?.id ?? '', page],
    queryFn: () => ReferralService.getReferees({ page, limit: REFERRAL.PAGE_SIZE }),
    enabled: isLogin && !!user?.id,
    staleTime: STALE_TIME,
  })

  return { referees: data?.data ?? [], totalPages: data?.meta?.totalPages ?? 1, isLoading, isError, refetch }
}

// My commission history (paginated)
export const useGetReferralCommissions = (page: number = 1) => {
  const { isLogin, user } = useUser()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.getReferralCommissions, user?.id ?? '', page],
    queryFn: () => ReferralService.getCommissions({ page, limit: REFERRAL.PAGE_SIZE }),
    enabled: isLogin && !!user?.id,
    staleTime: STALE_TIME,
  })

  return { commissions: data?.data ?? [], totalPages: data?.meta?.totalPages ?? 1, isLoading, isError, refetch }
}
