import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import { ORDER_STATUS } from '@/constants/app'
import OrderService, { OrderItem } from '@/services/order'

const useAdminListOrders = (params?: { page?: number; limit?: number; status?: ORDER_STATUS }) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery<{ data: OrderItem[]; meta?: any }>({
    queryKey: [QUERY_KEYS.getListOrder, params ?? {}],
    queryFn: () => OrderService.getOrders(params),
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListOrder] })
  }

  const { mutateAsync: updateOrderStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ORDER_STATUS }) => OrderService.updateOrderStatus(id, status),
    onSuccess: refresh,
  })

  return {
    orders: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
    updateOrderStatus,
    isUpdatingStatus,
  }
}

export default useAdminListOrders
