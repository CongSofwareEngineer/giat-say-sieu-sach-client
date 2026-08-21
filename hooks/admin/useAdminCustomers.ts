import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import { UserRole } from '@/services/users/type'
import UserService, { User } from '@/services/users'

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
    onSuccess: refresh,
  })

  const { mutateAsync: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) => UserService.updateUser(id, payload),
    onSuccess: refresh,
  })

  const { mutateAsync: deleteCustomer, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => UserService.deleteUser(id),
    onSuccess: refresh,
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
