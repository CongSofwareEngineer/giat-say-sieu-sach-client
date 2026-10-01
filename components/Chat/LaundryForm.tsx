'use client'

import type { AddressItem } from '@/services/address/type'
import type { PricingPlan } from '@/services/pricing'
import type { LaundryFormData } from './types'

import { useMemo } from 'react'

import MyButton from '@/components/MyButton'
import MySelect from '@/components/MySelect'
import useLanguage from '@/hooks/useLanguage'
import useGetProvinces from '@/hooks/reactQuery/useGetProvinces'
import useGetWards from '@/hooks/reactQuery/useGetWards'
import { formatAddress } from '@/services/address'
import { isValidVnPhone } from '@/utils/phone'

type LaundryFormProps = {
  formData: LaundryFormData
  addresses: AddressItem[]
  plans: PricingPlan[]
  estimatedPrice: number
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  onCancel: () => void
  isSubmitting?: boolean
}

const LaundryForm = ({ formData, addresses, plans, estimatedPrice, onChange, onSubmit, onCancel, isSubmitting = false }: LaundryFormProps) => {
  const { translate } = useLanguage()
  const { provinces, isLoading: loadingProvinces } = useGetProvinces()

  // Province is stored by name (same as profile AddressForm), wards are fetched by its id
  const selectedProvince = provinces.find((p) => p.name === formData.city)
  const { wards, isLoading: loadingWards } = useGetWards(selectedProvince?.id)

  const savedAddressOptions = useMemo(() => addresses.map((addr) => ({ value: addr.id, label: formatAddress(addr) })), [addresses])
  const cityOptions = useMemo(() => provinces.map((p) => ({ value: p.name, label: p.full_name || p.name })), [provinces])
  const wardOptions = useMemo(() => wards.map((w) => ({ value: w.name, label: w.full_name || w.name })), [wards])

  const handleSelectSavedAddress = (addressId: string) => {
    const addr = addresses.find((a) => a.id === addressId)

    if (!addr) return

    onChange('addressId', addr.id)
    onChange('address', addr.address)
    onChange('district', addr.district)
    onChange('city', addr.city)
  }

  // Editing any address part detaches the saved address so a new one is created on submit
  const handleManualAddressChange = (field: 'address' | 'district' | 'city', value: string) => {
    onChange('addressId', '')
    onChange(field, value)
  }

  const activePlans = plans.filter((p) => p.isActive)
  const serviceOptions =
    activePlans.length > 0
      ? activePlans.map((p) => ({ key: p.id, label: p.name }))
      : [
          { key: 'quan-ao', label: translate('chat.laundryForm.serviceOptions.clothes') },
          { key: 'chan-mem', label: translate('chat.laundryForm.serviceOptions.bedding') },
          { key: 'vest-ao-dai', label: translate('chat.laundryForm.serviceOptions.dryClean') },
          { key: 'giat-nhanh', label: translate('chat.laundryForm.serviceOptions.express') },
          { key: 'giat-ui', label: translate('chat.laundryForm.serviceOptions.washIron') },
        ]

  const selectedPlan =
    activePlans.find((p) => p.id === formData.serviceType) ||
    activePlans.find((p) => p.name === serviceOptions.find((o) => o.key === formData.serviceType)?.label)

  const isFormValid =
    formData.name.trim() &&
    isValidVnPhone(formData.phone) &&
    formData.address.trim() &&
    formData.district &&
    formData.city &&
    formData.weight.trim() &&
    parseFloat(formData.weight) > 0

  return (
    <div className='bg-white border border-border w-full rounded-xl p-4 space-y-4'>
      <h3 className='font-semibold text-primary'>{translate('chat.laundryForm.title')}</h3>

      <div className='space-y-3'>
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.name')}</label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={translate('chat.laundryForm.namePlaceholder')}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.phone')}</label>
          <input
            type='tel'
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder={translate('chat.laundryForm.phonePlaceholder')}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div className='space-y-2'>
          <label className='block text-xs font-medium text-gray-700'>{translate('common.address')}</label>
          {addresses.length > 0 && (
            <MySelect
              data={savedAddressOptions}
              value={formData.addressId}
              placeholder={translate('chat.laundryForm.savedAddress')}
              onChange={(item) => handleSelectSavedAddress(item.value as string)}
              className='text-sm'
              style={{ width: '100%' }}
            />
          )}
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.city')}</label>
          <MySelect
            data={cityOptions}
            value={formData.city}
            placeholder={loadingProvinces ? translate('common.loading') : translate('common.select')}
            disabled={loadingProvinces}
            onChange={(item) => {
              handleManualAddressChange('city', item.value as string)
              onChange('district', '')
            }}
            className='text-sm'
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.ward')}</label>
          <MySelect
            data={wardOptions}
            value={formData.district}
            placeholder={loadingWards ? translate('common.loading') : translate('common.select')}
            disabled={!selectedProvince || loadingWards}
            onChange={(item) => handleManualAddressChange('district', item.value as string)}
            className='text-sm'
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.addressDetail')}</label>
          <input
            type='text'
            value={formData.address}
            onChange={(e) => handleManualAddressChange('address', e.target.value)}
            placeholder={translate('chat.laundryForm.addressDetailPlaceholder')}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.serviceType')}</label>
          <select
            value={formData.serviceType}
            onChange={(e) => onChange('serviceType', e.target.value)}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white'
          >
            {serviceOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.weight')}</label>
          <input
            type='number'
            value={formData.weight}
            onChange={(e) => onChange('weight', e.target.value)}
            placeholder={translate('chat.laundryForm.weightPlaceholder')}
            min={1}
            step={1}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        {estimatedPrice > 0 && (
          <div className='p-3 bg-primary/5 border border-primary/20 rounded-lg'>
            <p className='text-sm text-primary font-medium'>
              {translate('chat.laundryForm.estimatedPrice')}:<span className='font-bold text-primary ml-1'>{estimatedPrice.toLocaleString()}đ</span>
              {selectedPlan && <span className='text-xs text-gray-500 ml-1'>/ {selectedPlan.unit || 'kg'}</span>}
            </p>
          </div>
        )}

        <div className='flex gap-2 pt-2'>
          <MyButton onClick={onCancel} variant='outline' className='flex-1 py-2 text-sm'>
            {translate('common.cancel')}
          </MyButton>
          <MyButton onClick={onSubmit} disabled={!isFormValid} loading={isSubmitting} className='flex-1 py-2 text-sm'>
            {translate('chat.laundryForm.submit')}
          </MyButton>
        </div>
      </div>
    </div>
  )
}

export default LaundryForm
