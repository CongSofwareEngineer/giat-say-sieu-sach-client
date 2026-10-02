import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { PAGE_SIZE } from '@/constants/app'
import { QUERY_KEYS } from '@/constants/reactQuery'
import useUser from '@/hooks/useUser'
import OrderService, { OrderItem } from '@/services/order'

// Orders of the logged-in customer (paginated) + cancelling a just-placed one
const useGetMyOrders = (page: number = 1) => {
  const queryClient = useQueryClient()
  const { isLogin, user } = useUser()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.getMyOrders, user?.id ?? '', page],
    queryFn: () => OrderService.getMyOrders({ page, limit: PAGE_SIZE }),
    enabled: isLogin && !!user?.id,
    staleTime: 30_000,
  })

  const { mutateAsync: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: (id: string) => OrderService.cancelMyOrder(id),
    onSuccess: (order: OrderItem) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getMyOrders] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getMyOrder, order.id] })
    },
  })

  return {
    orders: data?.data ?? [],
    totalPages: data?.meta?.totalPages ?? 1,
    isLoading,
    isError,
    refetch,
    cancelOrder,
    isCancelling,
  }
}

export default useGetMyOrders
