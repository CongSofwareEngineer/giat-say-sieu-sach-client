'use client'

import type { PromotionItem, PromotionPayload } from '@/services/promotion'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyTextarea from '@/components/MyTextarea'
import MyButton from '@/components/MyButton'
import useAdminPromotions from '@/hooks/admin/useAdminPromotions'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { PROMOTION_DISCOUNT_RANGE } from '@/constants/app'
import { toShopDate } from '@/services/promotion'

type PromotionFormProps = {
  // Edit mode when provided
  promotion?: PromotionItem
}

// API dates may be full ISO strings; date inputs need the shop-zone calendar day (YYYY-MM-DD)
const toInputDate = (date?: string) => (date ? toShopDate(date) : '')

const PromotionForm = ({ promotion }: PromotionFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { createPromotion, updatePromotion, isCreating, isUpdating } = useAdminPromotions()

  const [title, setTitle] = useState(promotion?.title ?? '')
  const [description, setDescription] = useState(promotion?.description ?? '')
  const [discountPercent, setDiscountPercent] = useState(promotion?.discountPercent ? String(promotion.discountPercent) : '')
  const [startDate, setStartDate] = useState(toInputDate(promotion?.startDate))
  const [endDate, setEndDate] = useState(toInputDate(promotion?.endDate))

  const [isSubmitted, setIsSubmitted] = useState(false)

  const percent = Number(discountPercent)
  const isTitleEmpty = isSubmitted && !title.trim()
  const isPercentInvalid = !!discountPercent && (percent < PROMOTION_DISCOUNT_RANGE.MIN || percent > PROMOTION_DISCOUNT_RANGE.MAX)
  // YYYY-MM-DD strings compare correctly as text
  const isDateInvalid = !!startDate && !!endDate && endDate < startDate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)

    if (!title.trim() || isPercentInvalid || isDateInvalid) return

    // Editing: send null for emptied fields so the server clears them (undefined keys are not sent);
    // creating: just leave them out
    const empty = promotion ? null : undefined
    const payload: PromotionPayload = {
      title: title.trim(),
      description: description.trim() || empty,
      discountPercent: discountPercent ? percent : empty,
      startDate: startDate || empty,
      endDate: endDate || empty,
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
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={isTitleEmpty ? translate('admin.promotions.nameRequired') : undefined}
        required
      />
      <MyTextarea
        label={translate('admin.promotions.description')}
        placeholder={translate('admin.promotions.descriptionPlaceholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <MyInput
        label={translate('admin.promotions.discountPercent')}
        type='number'
        min={PROMOTION_DISCOUNT_RANGE.MIN}
        max={PROMOTION_DISCOUNT_RANGE.MAX}
        value={discountPercent}
        onChange={(e) => setDiscountPercent(e.target.value)}
        error={
          isPercentInvalid
            ? translate('admin.promotions.percentInvalid', { min: PROMOTION_DISCOUNT_RANGE.MIN, max: PROMOTION_DISCOUNT_RANGE.MAX })
            : undefined
        }
      />
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
      <div className='flex justify-end pt-2'>
        <MyButton variant='outline' size='small' className='mr-2' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' size='small' loading={isCreating || isUpdating} disabled={isPercentInvalid || isDateInvalid}>
          {translate('common.save')}
        </MyButton>
      </div>
    </form>
  )
}

export default PromotionForm
