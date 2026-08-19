import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import AddressService, { getDefaultAddress } from '@/services/address'
import { AddressItem, CreateAddressPayload, UpdateAddressPayload } from '@/services/address/type'
import useUser from '@/hooks/useUser'
import { address } from '@/zustand/address'

const useGetListAddress = () => {
  const queryClient = useQueryClient()
  const { isLogin, user } = useUser()
  const { addresses, setAddresses, reset } = address()

  const { data, isLoading, isError, error, refetch } = useQuery<AddressItem[]>({
    queryKey: [QUERY_KEYS.getListAddresses, user?.id ?? ''],
    queryFn: () => AddressService.getMyAddresses(),
    enabled: isLogin && !!user?.id,
    staleTime: 5 * 60 * 1000,
  })

  // Keep the shared store in sync with the server data
  useEffect(() => {
    if (data) setAddresses(data)
  }, [data, setAddresses])

  // Drop the cached addresses of the previous session once logged out
  useEffect(() => {
    if (!isLogin) reset()
  }, [isLogin, reset])

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getListAddresses] })
  }

  const { mutateAsync: createAddress, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateAddressPayload) => AddressService.createAddress(payload),
    onSuccess: refresh,
  })

  const { mutateAsync: updateAddress, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAddressPayload }) => AddressService.updateAddress(id, payload),
    onSuccess: refresh,
  })

  const { mutateAsync: deleteAddress, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => AddressService.deleteAddress(id),
    onSuccess: refresh,
  })

  const { mutateAsync: setDefaultAddress, isPending: isSettingDefault } = useMutation({
    mutationFn: (id: string) => AddressService.setDefaultAddress(id),
    onSuccess: refresh,
  })

  return {
    addresses,
    defaultAddress: getDefaultAddress(addresses),
    isLoading,
    isError,
    error,
    refetch,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isCreating,
    isUpdating,
    isDeleting,
    isSettingDefault,
  }
}

export default useGetListAddress
