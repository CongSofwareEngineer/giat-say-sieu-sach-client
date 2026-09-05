'use client'

import MyBadge from '@/components/MyBadge'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import { EditIcon } from '@/components/Icons/Functions/Edit'
import { MapPinIcon } from '@/components/Icons/MapPin'
import { TrashIcon } from '@/components/Icons/Trash'
import useLanguage from '@/hooks/useLanguage'
import { formatAddress } from '@/services/address'
import { AddressItem } from '@/services/address/type'

export type AddressCardProps = {
  address: AddressItem
  isSettingDefault?: boolean
  onEdit: (address: AddressItem) => void
  onDelete: (address: AddressItem) => void
  onSetDefault: (address: AddressItem) => void
}

const AddressCard = ({ address, isSettingDefault = false, onEdit, onDelete, onSetDefault }: AddressCardProps) => {
  const { translate } = useLanguage()

  return (
    <li className='flex items-start justify-between gap-4 rounded-xl border border-border bg-white p-4'>
      <div className='flex gap-3'>
        <MapPinIcon className='mt-1 h-5 w-5 shrink-0 text-primary' />
        <div>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='font-medium text-text'>{address.phone}</p>
            {address.isDefault && (
              <MyBadge variant='primary'>
                <CheckBadgeIcon className='h-3 w-3 mr-1' />
                {translate('profile.addresses.default')}
              </MyBadge>
            )}
          </div>
          <p className='mt-1 text-sm text-gray-500'>{formatAddress(address)}</p>
          {!address.isDefault && (
            <button
              type='button'
              disabled={isSettingDefault}
              onClick={() => onSetDefault(address)}
              className='mt-2 text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSettingDefault ? translate('common.loading') : translate('profile.addresses.setDefault')}
            </button>
          )}
        </div>
      </div>
      <div className='flex gap-1'>
        <button
          type='button'
          aria-label={translate('profile.addresses.edit')}
          onClick={() => onEdit(address)}
          className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary'
        >
          <EditIcon className='h-5 w-5' />
        </button>
        <button
          type='button'
          aria-label={translate('profile.addresses.delete')}
          onClick={() => onDelete(address)}
          className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600'
        >
          <TrashIcon className='h-5 w-5' />
        </button>
      </div>
    </li>
  )
}

export default AddressCard
