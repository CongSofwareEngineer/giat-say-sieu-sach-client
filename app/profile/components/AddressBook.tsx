'use client'

import { useState } from 'react'

import AddressCard from './AddressCard'
import AddressForm from './AddressForm'
import DeleteAddressConfirm from './DeleteAddressConfirm'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyEmpty from '@/components/MyEmpty'
import MyLoading from '@/components/MyLoading'
import { PlusIcon } from '@/components/Icons/Plus'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useGetListAddress from '@/hooks/reactQuery/useGetListAddress'
import { AddressItem, CreateAddressPayload } from '@/services/address/type'

const AddressBook = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { addresses, isLoading, isError, refetch, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useGetListAddress()

  const [defaultPendingId, setDefaultPendingId] = useState('')
  const [actionError, setActionError] = useState('')

  // One form for both add & edit, the modal closes only when the request succeeds
  const openAddressForm = (address?: AddressItem) => {
    setActionError('')

    open({
      title: address ? translate('profile.addresses.edit') : translate('profile.addresses.add'),
      children: (
        <AddressForm
          address={address}
          onSubmit={async (payload: CreateAddressPayload) => {
            if (address) {
              await updateAddress({ id: address.id, payload })
            } else {
              await createAddress(payload)
            }

            close()
          }}
        />
      ),
    })
  }

  const openDeleteConfirm = (address: AddressItem) => {
    setActionError('')

    open({
      title: translate('profile.addresses.delete'),
      children: (
        <DeleteAddressConfirm
          address={address}
          onCancel={close}
          onConfirm={async () => {
            await deleteAddress(address.id)

            close()
          }}
        />
      ),
    })
  }

  const handleSetDefault = async (address: AddressItem) => {
    setActionError('')
    setDefaultPendingId(address.id)

    try {
      await setDefaultAddress(address.id)
    } catch {
      setActionError(translate('profile.addresses.errors.setDefault'))
    } finally {
      setDefaultPendingId('')
    }
  }

  const renderContent = () => {
    if (isLoading) return <MyLoading />

    if (isError) {
      return (
        <MyEmpty
          message={translate('profile.addresses.errors.load')}
          action={
            <MyButton variant='outline' onClick={() => refetch()}>
              {translate('common.retry')}
            </MyButton>
          }
        />
      )
    }

    if (addresses.length === 0) {
      return (
        <MyEmpty
          message={translate('profile.addresses.empty')}
          action={
            <MyButton variant='primary' onClick={() => openAddressForm()}>
              {translate('profile.addresses.add')}
            </MyButton>
          }
        />
      )
    }

    return (
      <ul className='space-y-3'>
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            isSettingDefault={defaultPendingId === address.id}
            onEdit={openAddressForm}
            onDelete={openDeleteConfirm}
            onSetDefault={handleSetDefault}
          />
        ))}
      </ul>
    )
  }

  return (
    <MyCard>
      <MyCardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <h2 className='text-lg font-bold text-text'>{translate('profile.addresses.title')}</h2>
          <p className='text-sm text-gray-500'>{translate('profile.addresses.subtitle')}</p>
        </div>
        <MyButton variant='primary' size='small' onClick={() => openAddressForm()}>
          <PlusIcon className='h-4 w-4 mr-1' />
          {translate('profile.addresses.add')}
        </MyButton>
      </MyCardHeader>
      <MyCardBody>
        {actionError && <p className='mb-4 text-sm text-red-600'>{actionError}</p>}
        {renderContent()}
      </MyCardBody>
    </MyCard>
  )
}

export default AddressBook
