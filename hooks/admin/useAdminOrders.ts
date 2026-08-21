import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import { ORDER_STATUS } from '@/constants/app'
import OrderService, { OrderItem } from '@/services/order'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

type AdminOrdersParams = {
  page?: number
  limit?: number
  status?: ORDER_STATUS
  userId?: string
  fromDate?: string
  toDate?: string
}

const useAdminOrders = (params?: AdminOrdersParams) => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

  const { data, isLoading, isError, error, refetch } = useQuery<{ data: OrderItem[]; meta?: any }>({
    queryKey: [QUERY_KEYS.getListOrder, params ?? {}],
    queryFn: () => OrderService.getOrders(params),
    staleTime: 30_000,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListOrder] })
  }

  const { mutateAsync: updateOrder, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status?: ORDER_STATUS; notes?: string } }) => OrderService.updateOrder(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.orders.updated', {}, 'Cập nhật đơn hàng thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: updateOrderStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ORDER_STATUS }) => OrderService.updateOrderStatus(id, status),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.orders.statusUpdated', {}, 'Cập nhật trạng thái thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: deleteOrder, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => OrderService.deleteOrder(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.orders.deleted', {}, 'Xóa đơn hàng thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  return {
    orders: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
  }
}

export default useAdminOrders
