'use client'

import type { PromotionItem, PromotionPayload } from '@/services/promotion'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MySelect from '@/components/MySelect'
import MyTextarea from '@/components/MyTextarea'
import MyButton from '@/components/MyButton'
import useAdminPromotions from '@/hooks/admin/useAdminPromotions'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { PROMOTION_DISCOUNT_RANGE, PROMOTION_DISCOUNT_TYPE } from '@/constants/app'
import { toShopDate } from '@/services/promotion'

type PromotionFormProps = {
  // Edit mode when provided
  promotion?: PromotionItem
}

// API dates are full ISO strings; date inputs need the shop-zone calendar day (YYYY-MM-DD)
const toInputDate = (date?: string | null) => (date ? toShopDate(date) : '')

const PromotionForm = ({ promotion }: PromotionFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { createPromotion, updatePromotion, isCreating, isUpdating } = useAdminPromotions()

  const [name, setName] = useState(promotion?.name ?? '')
  const [code, setCode] = useState(promotion?.code ?? '')
  const [description, setDescription] = useState(promotion?.description ?? '')
  const [discountType, setDiscountType] = useState(promotion?.discountType ?? PROMOTION_DISCOUNT_TYPE.PERCENTAGE)
  const [discountValue, setDiscountValue] = useState(promotion?.discountValue ? String(promotion.discountValue) : '')
  const [startDate, setStartDate] = useState(toInputDate(promotion?.startAt))
  const [endDate, setEndDate] = useState(toInputDate(promotion?.endAt))
  const [isActive, setIsActive] = useState(promotion?.isActive ?? true)

  const [isSubmitted, setIsSubmitted] = useState(false)

  const isPercentage = discountType === PROMOTION_DISCOUNT_TYPE.PERCENTAGE
  const value = Number(discountValue)
  const isNameEmpty = isSubmitted && !name.trim()
  const isValueInvalid = !!discountValue && (isPercentage ? value < PROMOTION_DISCOUNT_RANGE.MIN || value > PROMOTION_DISCOUNT_RANGE.MAX : value <= 0)
  // YYYY-MM-DD strings compare correctly as text
  const isDateInvalid = !!startDate && !!endDate && endDate < startDate

  const discountTypeOptions = Object.values(PROMOTION_DISCOUNT_TYPE).map((type) => ({
    value: type,
    label: translate(`admin.promotions.discountTypes.${type}`),
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)

    if (!name.trim() || isValueInvalid || isDateInvalid) return

    // Editing: send null for emptied code / description / dates so the server clears them
    // (undefined keys are not sent); creating: just leave them out
    const empty = promotion ? null : undefined
    const payload: PromotionPayload = {
      name: name.trim(),
      code: code.trim().toUpperCase() || empty,
      description: description.trim() || empty,
      discountType,
      discountValue: discountValue ? value : 0,
      startAt: startDate || empty,
      endAt: endDate || empty,
      isActive,
    }

    try {
      if (promotion) {
        await updatePromotion({ id: promotion.id, payload })
      } else {
        await createPromotion(payload)
      }
      close()
    } catch {
      // Error toast is shown by the mutation
    }
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <MyInput
        label={translate('admin.promotions.name')}
        placeholder={translate('admin.promotions.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={isNameEmpty ? translate('admin.promotions.nameRequired') : undefined}
        required
      />
      <div>
        <MyInput
          label={translate('admin.promotions.code')}
          placeholder={translate('admin.promotions.codePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <p className='mt-1 text-xs text-gray-500'>{translate('admin.promotions.codeHint')}</p>
      </div>
      <MyTextarea
        label={translate('admin.promotions.description')}
        placeholder={translate('admin.promotions.descriptionPlaceholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <MySelect
          label={translate('admin.promotions.discountType')}
          data={discountTypeOptions}
          value={discountType}
          onChange={(item) => setDiscountType(item.value as PROMOTION_DISCOUNT_TYPE)}
        />
        <MyInput
          label={translate(isPercentage ? 'admin.promotions.discountPercent' : 'admin.promotions.discountAmount')}
          type='number'
          min={isPercentage ? PROMOTION_DISCOUNT_RANGE.MIN : 0}
          max={isPercentage ? PROMOTION_DISCOUNT_RANGE.MAX : undefined}
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          error={
            isValueInvalid
              ? isPercentage
                ? translate('admin.promotions.percentInvalid', { min: PROMOTION_DISCOUNT_RANGE.MIN, max: PROMOTION_DISCOUNT_RANGE.MAX })
                : translate('admin.promotions.amountInvalid')
              : undefined
          }
        />
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <MyInput label={translate('admin.promotions.startDate')} type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <MyInput
          label={translate('admin.promotions.endDate')}
          type='date'
          value={endDate}
          min={startDate || undefined}
          onChange={(e) => setEndDate(e.target.value)}
          error={isDateInvalid ? translate('admin.promotions.dateInvalid') : undefined}
        />
      </div>
      <p className='text-xs text-gray-500'>{translate('admin.promotions.dateHint')}</p>
      <label className='flex cursor-pointer items-center gap-3'>
        <input type='checkbox' className='toggle toggle-primary toggle-sm' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className='text-sm text-text'>{translate('admin.promotions.isActive')}</span>
      </label>
      <div className='flex justify-end pt-2'>
        <MyButton variant='outline' size='small' className='mr-2' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' size='small' loading={isCreating || isUpdating} disabled={isValueInvalid || isDateInvalid}>
          {translate('common.save')}
        </MyButton>
      </div>
    </form>
  )
}

export default PromotionForm
