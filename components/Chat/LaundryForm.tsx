'use client'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'

type LaundryFormProps = {
  formData: {
    name: string
    phone: string
    address: string
    serviceType: string
    weight: string
  }
  estimatedPrice: number
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

const LaundryForm = ({ formData, estimatedPrice, onChange, onSubmit, onCancel }: LaundryFormProps) => {
  const { translate } = useLanguage()
  const serviceOptions = [
    { key: 'quan-ao', label: translate('chat.laundryForm.serviceOptions.clothes') || 'Quần áo thường' },
    { key: 'chan-mem', label: translate('chat.laundryForm.serviceOptions.bedding') || 'Chăn mền' },
    { key: 'vest-ao-dai', label: translate('chat.laundryForm.serviceOptions.dryClean') || 'Vest/Áo dài (giặt khô)' },
    { key: 'giat-nhanh', label: translate('chat.laundryForm.serviceOptions.express') || 'Giặt nhanh' },
    { key: 'giat-ui', label: translate('chat.laundryForm.serviceOptions.washIron') || 'Giặt + Ủi' },
  ]

  const isFormValid =
    formData.name.trim() && formData.phone.trim() && formData.address.trim() && formData.weight.trim() && parseFloat(formData.weight) > 0

  return (
    <div className='bg-white border border-border w-full rounded-xl p-4 space-y-4'>
      <h3 className='font-semibold text-primary'>{translate('chat.laundryForm.title') || 'Đặt dịch vụ giặt đồ'}</h3>

      <div className='space-y-3'>
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.name') || 'Họ tên'}</label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={translate('chat.laundryForm.namePlaceholder') || 'Nhập họ tên'}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.phone') || 'Số điện thoại'}</label>
          <input
            type='tel'
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder={translate('chat.laundryForm.phonePlaceholder') || 'Nhập số điện thoại'}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.address') || 'Địa chỉ'}</label>
          <input
            type='text'
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder={translate('chat.laundryForm.addressPlaceholder') || 'Nhập địa chỉ'}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.serviceType') || 'Loại dịch vụ'}</label>
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
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.weight') || 'Khối lượng (kg)'}</label>
          <input
            type='number'
            value={formData.weight}
            onChange={(e) => onChange('weight', e.target.value)}
            placeholder={translate('chat.laundryForm.weightPlaceholder') || 'Nhập số kg'}
            min='1'
            step='0.1'
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        {estimatedPrice > 0 && (
          <div className='p-3 bg-primary/5 border border-primary/20 rounded-lg'>
            <p className='text-sm text-primary font-medium'>
              {translate('chat.laundryForm.estimatedPrice') || 'Giá ước tính'}:
              <span className='font-bold text-primary ml-1'>{estimatedPrice.toLocaleString()}đ</span>
            </p>
          </div>
        )}

        <div className='flex gap-2 pt-2'>
          <MyButton onClick={onCancel} variant='outline' className='flex-1 py-2 text-sm'>
            {translate('common.cancel') || 'Hủy'}
          </MyButton>
          <MyButton onClick={onSubmit} disabled={!isFormValid} className='flex-1 py-2 text-sm'>
            {translate('chat.laundryForm.submit') || 'Đặt lịch'}
          </MyButton>
        </div>
      </div>
    </div>
  )
}

export default LaundryForm
