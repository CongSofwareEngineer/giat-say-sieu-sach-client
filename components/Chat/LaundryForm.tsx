'use client'

import type { AddressItem } from '@/services/address/type'
import type { PricingPlan } from '@/services/pricing'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'

type LaundryFormProps = {
  formData: {
    name: string
    phone: string
    addressId: string
    address: string
    serviceType: string
    weight: string
  }
  addresses: AddressItem[]
  plans: PricingPlan[]
  estimatedPrice: number
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

const LaundryForm = ({ formData, addresses, plans, estimatedPrice, onChange, onSubmit, onCancel }: LaundryFormProps) => {
  const { translate } = useLanguage()

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
    formData.name.trim() && formData.phone.trim() && formData.address.trim() && formData.weight.trim() && parseFloat(formData.weight) > 0

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

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.address')}</label>
          {addresses.length > 0 && (
            <select
              value={formData.addressId}
              onChange={(e) => {
                const addr = addresses.find((a) => a.id === e.target.value)

                if (addr) {
                  onChange('addressId', addr.id)
                  onChange('address', [addr.address, addr.district, addr.city].filter(Boolean).join(', '))
                }
              }}
              className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white mb-2'
            >
              <option value=''>-- Chọn địa chỉ đã lưu --</option>
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {[addr.address, addr.district, addr.city].filter(Boolean).join(', ')}
                </option>
              ))}
            </select>
          )}
          <input
            type='text'
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder={translate('chat.laundryForm.addressPlaceholder')}
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
          <MyButton onClick={onSubmit} disabled={!isFormValid} className='flex-1 py-2 text-sm'>
            {translate('chat.laundryForm.submit')}
          </MyButton>
        </div>
      </div>
    </div>
  )
}

export default LaundryForm
