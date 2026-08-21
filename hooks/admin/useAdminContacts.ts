import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import ContactService, { ContactItem } from '@/services/contact'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'

type AdminContactsParams = {
  page?: number
  limit?: number
  status?: string
}

const useAdminContacts = (params?: AdminContactsParams) => {
  const queryClient = useQueryClient()
  const { translate } = useLanguage()

  const { data, isLoading, isError, error, refetch } = useQuery<{ data: ContactItem[]; meta?: any }>({
    queryKey: [QUERY_KEYS.getListContacts, params ?? {}],
    queryFn: () => ContactService.getContacts(params),
    staleTime: 30_000,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListContacts] })
  }

  const { mutateAsync: updateContact, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { name?: string; phone?: string; email?: string; subject?: string; message?: string; status?: string }
    }) => ContactService.updateContact(id, payload),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.contacts.updated', {}, 'Cập nhật liên hệ thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: updateContactStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ContactService.updateContactStatus(id, status),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.contacts.statusUpdated', {}, 'Cập nhật trạng thái thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  const { mutateAsync: deleteContact, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => ContactService.deleteContact(id),
    onSuccess: () => {
      refresh()
      toast({ message: translate('admin.contacts.deleted', {}, 'Xóa liên hệ thành công'), type: 'default' })
    },
    onError: () => {
      toast({ message: translate('common.error'), type: 'error' })
    },
  })

  return {
    contacts: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
    updateContact,
    updateContactStatus,
    deleteContact,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
  }
}

export default useAdminContacts
