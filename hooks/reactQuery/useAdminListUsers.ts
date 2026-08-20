import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import UserService, { User } from '@/services/users'

const useAdminListUsers = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery<{ data: User[]; meta?: any }>({
    queryKey: [QUERY_KEYS.getListUsers],
    queryFn: () => UserService.getUsers(),
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListUsers] })
  }

  const { mutateAsync: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => UserService.deleteUser(id),
    onSuccess: refresh,
  })

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) => UserService.updateUser(id, payload),
    onSuccess: refresh,
  })

  return {
    users: data?.data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    deleteUser,
    isDeleting,
    updateUser,
    isUpdating,
  }
}

export default useAdminListUsers
