'use client'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'
import { formatAddress } from '@/services/address'
import { AddressItem } from '@/services/address/type'

export type DeleteAddressConfirmProps = {
  address: AddressItem
  onCancel: () => void
  onConfirm: () => Promise<void>
}

const DeleteAddressConfirm = ({ address, onCancel, onConfirm }: DeleteAddressConfirmProps) => {
  const { translate } = useLanguage()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleConfirm = async () => {
    if (isDeleting) return

    setDeleteError('')
    setIsDeleting(true)

    try {
      await onConfirm()
    } catch {
      setDeleteError(translate('profile.addresses.errors.delete'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='w-full'>
      <p className='mb-2 text-sm text-gray-600'>{translate('profile.addresses.deleteConfirm')}</p>
      <p className='mb-6 text-sm font-medium text-text'>
        {address.phone} · {formatAddress(address)}
      </p>
      {deleteError && <p className='mb-4 text-sm text-red-600'>{deleteError}</p>}
      <div className='flex justify-end gap-3'>
        <MyButton variant='outline' onClick={onCancel}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton variant='error' loading={isDeleting} onClick={handleConfirm}>
          {translate('common.delete')}
        </MyButton>
      </div>
    </div>
  )
}

export default DeleteAddressConfirm
