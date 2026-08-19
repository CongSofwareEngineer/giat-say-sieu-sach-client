import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import ContactService, { ContactItem } from '@/services/contact'

const useGetListContact = (params?: { page?: number; limit?: number; status?: string }) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery<{ data: ContactItem[]; meta?: any }>({
    queryKey: [QUERY_KEYS.getListContacts, params ?? {}],
    queryFn: () => ContactService.getContacts(params),
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListContacts] })
  }

  const { mutateAsync: deleteContact, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => ContactService.deleteContact(id),
    onSuccess: refresh,
  })

  const { mutateAsync: updateContactStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ContactService.updateContactStatus(id, status),
    onSuccess: refresh,
  })

  return {
    contacts: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
    deleteContact,
    updateContactStatus,
    isDeleting,
    isUpdatingStatus,
  }
}

export default useGetListContact
