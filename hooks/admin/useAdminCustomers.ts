import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import { UserRole } from '@/services/users/type'
import UserService, { User } from '@/services/users'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

type AdminCustomersParams = {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
}

type CreateCustomerPayload = {
  phone: string
  name: string
  password: string
  role?: UserRole
  avatar?: string
  isActive?: boolean
}

type UpdateCustomerPayload = {
  phone?: string
  name?: string
  avatar?: string
  isActive?: boolean
}

const useAdminCustomers = (params?: AdminCustomersParams) => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

  const { data, isLoading, isError, error, refetch } = useQuery<{ data: User[]; meta?: any }>({
    queryKey: [QUERY_KEYS.getListUsers, params ?? {}],
    queryFn: () => UserService.getUsers(params),
    staleTime: 30_000,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListUsers] })
  }

  const { mutateAsync: createCustomer, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateCustomerPayload) => UserService.createUser(payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.customers.created', {}, 'Thêm khách hàng thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) => UserService.updateUser(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.customers.updated', {}, 'Cập nhật khách hàng thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: deleteCustomer, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => UserService.deleteUser(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.customers.deleted', {}, 'Xóa khách hàng thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  return {
    customers: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

export default useAdminCustomers
