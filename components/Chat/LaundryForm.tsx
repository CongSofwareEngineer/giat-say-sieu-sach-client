'use client'

import type { AddressItem } from '@/services/address/type'
import type { PricingPlan } from '@/services/pricing'
import type { OrderPricing } from '@/utils/orderPricing'
import type { LaundryFormData } from './types'

import { useEffect, useMemo } from 'react'

import MyButton from '@/components/MyButton'
import MySelect from '@/components/MySelect'
import useLanguage from '@/hooks/useLanguage'
import useGetProvinces from '@/hooks/reactQuery/useGetProvinces'
import useGetWards from '@/hooks/reactQuery/useGetWards'
import useGetListBranches from '@/hooks/reactQuery/useGetListBranches'
import { formatAddress } from '@/services/address'
import { getBranchCities } from '@/services/branch'
import { LOYALTY_REDEEM, MAX_BOOKING_NOTE_LENGTH, WEIGHT_DISCOUNT } from '@/constants/app'
import { cn } from '@/utils/tailwind'
import { isValidVnPhone } from '@/utils/phone'

type LaundryFormProps = {
  formData: LaundryFormData
  addresses: AddressItem[]
  plans: PricingPlan[]
  pricing: OrderPricing
  // Points of the logged-in customer; the redeem checkbox is hidden below one redeem step
  pointsBalance?: number
  usePoints?: boolean
  onToggleUsePoints?: (usePoints: boolean) => void
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  // Cancel button is hidden when not provided (booking page)
  onCancel?: () => void
  isSubmitting?: boolean
  showTitle?: boolean
  className?: string
}

const normalizeCity = (city: string) => city.trim().toLowerCase()

const LaundryForm = ({
  formData,
  addresses,
  plans,
  pricing,
  pointsBalance = 0,
  usePoints = false,
  onToggleUsePoints,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showTitle = true,
  className = '',
}: LaundryFormProps) => {
  const { translate } = useLanguage()
  const { provinces, isLoading: loadingProvinces } = useGetProvinces()
  const { branches } = useGetListBranches()

  // Only provinces that have a branch; fall back to all when no branch city matches (empty list / API error)
  const allowedProvinces = useMemo(() => {
    const branchCities = new Set(getBranchCities(branches).map(normalizeCity))
    const matched = provinces.filter((p) => branchCities.has(normalizeCity(p.name)))

    return matched.length > 0 ? matched : provinces
  }, [provinces, branches])

  const isCityAllowed = (city: string) => allowedProvinces.some((p) => p.name === city)

  // Province is stored by name (same as profile AddressForm), wards are fetched by its id
  const selectedProvince = provinces.find((p) => p.name === formData.city)
  const { wards, isLoading: loadingWards } = useGetWards(selectedProvince?.id)

  const savedAddressOptions = useMemo(
    () =>
      addresses.filter((addr) => allowedProvinces.some((p) => p.name === addr.city)).map((addr) => ({ value: addr.id, label: formatAddress(addr) })),
    [addresses, allowedProvinces]
  )
  const cityOptions = useMemo(() => allowedProvinces.map((p) => ({ value: p.name, label: p.full_name || p.name })), [allowedProvinces])
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

  // Prefilled address (default / last booking) outside the served provinces: clear it so the user picks again
  const isPrefilledCityOutside = provinces.length > 0 && !!formData.city && !isCityAllowed(formData.city)

  useEffect(() => {
    if (!isPrefilledCityOutside) return

    onChange('addressId', '')
    onChange('city', '')
    onChange('district', '')
  }, [isPrefilledCityOutside, onChange])

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
    !isPrefilledCityOutside &&
    formData.weight.trim() &&
    parseFloat(formData.weight) > 0

  const formatPrice = (price: number) => translate('tracking.result.price', { price: price.toLocaleString('vi-VN') })
  const canRedeemPoints = !!onToggleUsePoints && pointsBalance >= LOYALTY_REDEEM.POINTS_STEP
  const weight = parseFloat(formData.weight)
  const showWeightHint = weight > 0 && weight <= WEIGHT_DISCOUNT.MIN_KG

  return (
    <div className={cn('bg-white border border-border w-full rounded-xl p-4 space-y-4', className)}>
      {showTitle && <h3 className='font-semibold text-primary'>{translate('chat.laundryForm.title')}</h3>}

      <div className='space-y-3'>
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.name')}</label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={translate('chat.laundryForm.namePlaceholder')}
            className='w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-white transition-[border-color,box-shadow] hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.phone')}</label>
          <input
            type='tel'
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder={translate('chat.laundryForm.phonePlaceholder')}
            className='w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-white transition-[border-color,box-shadow] hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10'
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
            className='w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-white transition-[border-color,box-shadow] hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.serviceType')}</label>
          <MySelect
            data={serviceOptions.map((option) => ({ value: option.key, label: option.label }))}
            value={formData.serviceType}
            search={false}
            onChange={(item) => onChange('serviceType', item.value as string)}
            className='text-sm'
            style={{ width: '100%' }}
          />
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
            className='w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-white transition-[border-color,box-shadow] hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.note')}</label>
          <textarea
            rows={2}
            value={formData.note}
            onChange={(e) => onChange('note', e.target.value)}
            placeholder={translate('chat.laundryForm.notePlaceholder')}
            maxLength={MAX_BOOKING_NOTE_LENGTH}
            className='w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-white transition-[border-color,box-shadow] hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none'
          />
        </div>

        {canRedeemPoints && (
          <label className='flex cursor-pointer items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-3 transition-colors hover:bg-accent/15'>
            <input
              type='checkbox'
              checked={usePoints}
              onChange={(e) => onToggleUsePoints?.(e.target.checked)}
              className='mt-0.5 size-4 shrink-0 rounded border-gray-300 accent-primary'
            />
            <span className='min-w-0'>
              <span className='block text-sm font-semibold text-text'>{translate('booking.points.label')}</span>
              <span className='block text-xs text-gray-600'>
                {translate('booking.points.balance', {
                  points: pointsBalance.toLocaleString('vi-VN'),
                  step: LOYALTY_REDEEM.POINTS_STEP,
                  value: LOYALTY_REDEEM.VND_PER_STEP.toLocaleString('vi-VN'),
                })}
              </span>
              <span className='block text-xs text-gray-500'>{translate('booking.points.deductNote')}</span>
            </span>
          </label>
        )}

        {pricing.totalAmount > 0 && (
          <div className='space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm'>
            <div className='flex items-center justify-between gap-3 text-gray-600'>
              <span>
                {translate('booking.pricing.subtotal')}
                {selectedPlan && (
                  <span className='ml-1 text-xs text-gray-500'>
                    ({formatPrice(selectedPlan.price)}
                    {selectedPlan.unit ? ` / ${selectedPlan.unit}` : translate('home.pricing.perKg')})
                  </span>
                )}
              </span>
              <span className='font-medium text-text'>{formatPrice(pricing.totalAmount)}</span>
            </div>
            {pricing.weightDiscount > 0 && (
              <div className='flex items-center justify-between gap-3 text-emerald-700'>
                <span>{translate('booking.pricing.weightDiscount', { kg: WEIGHT_DISCOUNT.MIN_KG })}</span>
                <span className='font-medium'>-{formatPrice(pricing.weightDiscount)}</span>
              </div>
            )}
            {pricing.pointsDiscount > 0 && (
              <div className='flex items-center justify-between gap-3 text-emerald-700'>
                <span>{translate('booking.pricing.pointsDiscount', { points: pricing.pointsUsed.toLocaleString('vi-VN') })}</span>
                <span className='font-medium'>-{formatPrice(pricing.pointsDiscount)}</span>
              </div>
            )}
            <div className='flex items-center justify-between gap-3 border-t border-primary/15 pt-1.5'>
              <span className='font-semibold text-primary'>{translate('chat.laundryForm.estimatedPrice')}</span>
              <span className='text-base font-bold text-primary'>{formatPrice(pricing.finalAmount)}</span>
            </div>
            {showWeightHint && (
              <p className='text-xs text-gray-500'>
                {translate('booking.pricing.weightHint', { kg: WEIGHT_DISCOUNT.MIN_KG, amount: formatPrice(WEIGHT_DISCOUNT.AMOUNT) })}
              </p>
            )}
          </div>
        )}

        <div className='flex gap-2 pt-2'>
          {onCancel && (
            <MyButton onClick={onCancel} variant='outline' className='flex-1 py-2 text-sm'>
              {translate('common.cancel')}
            </MyButton>
          )}
          <MyButton onClick={onSubmit} disabled={!isFormValid} loading={isSubmitting} className='flex-1 py-2 text-sm'>
            {translate('chat.laundryForm.submit')}
          </MyButton>
        </div>
      </div>
    </div>
  )
}

export default LaundryForm
