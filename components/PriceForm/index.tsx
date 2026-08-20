'use client'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import { LANGUAGE_SUPPORT } from '@/zustand/language'
import { PricingPlan, UpdatePricingPlanPayload } from '@/services/pricing'
import useAdminListPrice from '@/hooks/reactQuery/useAdminListPrice'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

type PriceFormProps = {
  plan: PricingPlan
}

const LANGUAGES: { key: LANGUAGE_SUPPORT; label: string }[] = [
  { key: LANGUAGE_SUPPORT.VN, label: 'Tiếng Việt' },
  { key: LANGUAGE_SUPPORT.EN, label: 'English' },
]

const PriceForm = ({ plan }: PriceFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { updatePlan, isUpdating } = useAdminListPrice()

  const [name, setName] = useState(plan.name)
  const [price, setPrice] = useState(String(plan.price))
  const [unit, setUnit] = useState(plan.unit)
  const [isActive, setIsActive] = useState(plan.isActive)
  const [popular, setPopular] = useState(plan.popular ?? false)

  const [features, setFeatures] = useState<Record<LANGUAGE_SUPPORT, string[]>>({
    [LANGUAGE_SUPPORT.VN]: plan.features?.[LANGUAGE_SUPPORT.VN] ?? [],
    [LANGUAGE_SUPPORT.EN]: plan.features?.[LANGUAGE_SUPPORT.EN] ?? [],
  })

  const handleFeatureChange = (lang: LANGUAGE_SUPPORT, index: number, value: string) => {
    setFeatures((prev) => ({
      ...prev,
      [lang]: prev[lang].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addFeature = (lang: LANGUAGE_SUPPORT) => {
    setFeatures((prev) => ({
      ...prev,
      [lang]: [...prev[lang], ''],
    }))
  }

  const removeFeature = (lang: LANGUAGE_SUPPORT, index: number) => {
    setFeatures((prev) => ({
      ...prev,
      [lang]: prev[lang].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

     const payload: UpdatePricingPlanPayload = {
      name,
      price: Number(price),
      unit,
      isActive,
      popular,
      features,
    }

    await updatePlan({ id: plan.id, payload })
    close()
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <MyInput
        label={translate('admin.prices.name', {}, 'Tên dịch vụ')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className='space-y-4'>
        <p className='text-sm font-medium text-text'>Đặc điểm dịch vụ (Features)</p>
        {LANGUAGES.map(({ key, label }) => (
          <div key={key} className='space-y-2'>
            <label className='text-xs font-medium text-gray-600'>{label}</label>
            {features[key].map((feature, index) => (
              <div key={index} className='flex items-center gap-2'>
                <MyInput
                  value={feature}
                  onChange={(e) => handleFeatureChange(key, index, e.target.value)}
                  placeholder={`Đặc điệm ${index + 1}`}
                  className='flex-1 py-1 text-sm'
                />
                <button
                  type='button'
                  onClick={() => removeFeature(key, index)}
                  className='rounded-lg p-1 text-red-500 hover:bg-red-50'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type='button'
              onClick={() => addFeature(key)}
              className='text-xs text-primary hover:underline'
            >
              + Thêm đặc điệm
            </button>
          </div>
        ))}
      </div>

      <MyInput
        label={translate('admin.prices.price', {}, 'Đơn giá')}
        type='number'
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <MyInput
        label={translate('admin.prices.unit', {}, 'Đơn vị')}
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        placeholder={translate('admin.prices.unitPlaceholder', {}, 'Ví dụ: VNĐ/kg')}
      />
      <div className='flex items-center gap-4'>
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className='rounded border-border' />
          <span>{translate('admin.prices.active', {}, 'Đang hoạt động')}</span>
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' checked={popular} onChange={(e) => setPopular(e.target.checked)} className='rounded border-border' />
          <span>{translate('admin.prices.popular', {}, 'Phổ biến')}</span>
        </label>
      </div>
      <div className='flex justify-end pt-2'>
        <MyButton variant='outline' size='small' className='mr-2' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' size='small' loading={isUpdating}>
          {translate('common.save')}
        </MyButton>
      </div>
    </form>
  )
}

export default PriceForm
