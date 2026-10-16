'use client'

import type { AddressItem } from '@/services/address/type'
import type { PricingPlan } from '@/services/pricing'
import type { OrderPricing } from '@/utils/orderPricing'
import type { LaundryFormData } from './types'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'

import MyButton from '@/components/MyButton'
import MySelect from '@/components/MySelect'
import useLanguage from '@/hooks/useLanguage'
import useGetProvinces from '@/hooks/reactQuery/useGetProvinces'
import useGetWards from '@/hooks/reactQuery/useGetWards'
import useGetListBranches from '@/hooks/reactQuery/useGetListBranches'
import { formatAddress } from '@/services/address'
import { getBranchCities } from '@/services/branch'
import {
  getAvailablePickupSlots,
  getAvailableReturnSlots,
  getDefaultPickup,
  getDefaultReturn,
  getPickupDates,
  getPickupSlotKey,
  getReturnDates,
  isPickupValid,
  isReturnValid,
  isWeightValid,
  type PickupSlot,
} from '@/agents/tools/booking'
import {
  INPUT_DATE_FORMAT,
  LOYALTY_REDEEM,
  MAX_BOOKING_NOTE_LENGTH,
  PICKUP_REFRESH_INTERVAL,
  PICKUP_TIME_SLOTS,
  SHORT_DATE_FORMAT,
  WASH_DURATION_HOURS,
  WEIGHT_DISCOUNT,
} from '@/constants/app'
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

  // Pickup options depend on the current time: build them only on the client to avoid a hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  const [, setRefreshTick] = useState(0)
  // True after the picked slot expired and was moved automatically, so the customer notices the change
  const [isPickupMoved, setIsPickupMoved] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Re-render periodically so a slot that just expired is noticed while the form stays open
    const timer = setInterval(() => setRefreshTick((tick) => tick + 1), PICKUP_REFRESH_INTERVAL)

    return () => clearInterval(timer)
  }, [])

  const now = isMounted ? dayjs() : null
  const today = now?.format(INPUT_DATE_FORMAT)
  const tomorrow = now?.add(1, 'day').format(INPUT_DATE_FORMAT)

  const toDateOption = (date: string) => {
    const label = dayjs(date).format(SHORT_DATE_FORMAT)

    if (date === today) return { value: date, label: translate('booking.pickup.today', { date: label }) }
    if (date === tomorrow) return { value: date, label: translate('booking.pickup.tomorrow', { date: label }) }

    return { value: date, label }
  }
  const toSlotOption = (slot: PickupSlot) => ({
    value: getPickupSlotKey(slot),
    label: translate('booking.pickup.slot', { start: slot.start, end: slot.end }),
  })

  const { pickupDate, pickupSlot, returnDate, returnSlot } = formData
  const openingHours = { open: PICKUP_TIME_SLOTS[0].start, close: PICKUP_TIME_SLOTS[PICKUP_TIME_SLOTS.length - 1].end }
  const pickupDateOptions = (now ? getPickupDates(now) : []).map(toDateOption)
  const pickupSlotOptions = (now && pickupDate ? getAvailablePickupSlots(pickupDate, now) : []).map(toSlotOption)
  const returnDateOptions = (isMounted ? getReturnDates(pickupDate, pickupSlot) : []).map(toDateOption)
  const returnSlotOptions = (isMounted && returnDate ? getAvailableReturnSlots(returnDate, pickupDate, pickupSlot) : []).map(toSlotOption)

  // New date: keep the picked slot when that day still has it, else take the day's first slot
  const handlePickupDateChange = (date: string) => {
    const slots = getAvailablePickupSlots(date)

    setIsPickupMoved(false)
    onChange('pickupDate', date)
    if (!slots.some((slot) => getPickupSlotKey(slot) === pickupSlot)) onChange('pickupSlot', slots[0] ? getPickupSlotKey(slots[0]) : '')
  }

  const handlePickupSlotChange = (slotKey: string) => {
    setIsPickupMoved(false)
    onChange('pickupSlot', slotKey)
  }

  const handleReturnDateChange = (date: string) => {
    const slots = getAvailableReturnSlots(date, pickupDate, pickupSlot)

    onChange('returnDate', date)
    if (!slots.some((slot) => getPickupSlotKey(slot) === returnSlot)) onChange('returnSlot', slots[0] ? getPickupSlotKey(slots[0]) : '')
  }

  // Picked slot expired while the form was open: move to the first slot left and tell the customer
  const isPickupStale = isMounted && !!pickupDate && !isPickupValid(pickupDate, pickupSlot)

  useEffect(() => {
    if (!isPickupStale) return

    const [firstSlot] = getAvailablePickupSlots(pickupDate)

    setIsPickupMoved(true)

    if (firstSlot) {
      onChange('pickupSlot', getPickupSlotKey(firstSlot))

      return
    }

    const fallback = getDefaultPickup()

    onChange('pickupDate', fallback.pickupDate)
    onChange('pickupSlot', fallback.pickupSlot)
  }, [isPickupStale, pickupDate, onChange])

  // Pickup moved later than the return allows: keep the return day when it still has a slot, else take the earliest return
  const isReturnStale = isMounted && !isPickupStale && !!pickupDate && !isReturnValid(returnDate, returnSlot, pickupDate, pickupSlot)

  useEffect(() => {
    if (!isReturnStale) return

    const [firstSlot] = returnDate ? getAvailableReturnSlots(returnDate, pickupDate, pickupSlot) : []

    if (firstSlot) {
      onChange('returnSlot', getPickupSlotKey(firstSlot))

      return
    }

    const fallback = getDefaultReturn(pickupDate, pickupSlot)

    onChange('returnDate', fallback.returnDate)
    onChange('returnSlot', fallback.returnSlot)
  }, [isReturnStale, returnDate, pickupDate, pickupSlot, onChange])

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
    isWeightValid(formData.weight) &&
    isPickupValid(pickupDate, pickupSlot) &&
    isReturnValid(returnDate, returnSlot, pickupDate, pickupSlot)

  const formatPrice = (price: number) => translate('tracking.result.price', { price: price.toLocaleString('vi-VN') })
  const canRedeemPoints = !!onToggleUsePoints && pointsBalance >= LOYALTY_REDEEM.POINTS_STEP
  const weight = parseFloat(formData.weight)
  // Points are reserved from the order amount, so they need a real weight estimate (not the placeholder kg)
  const hasWeight = weight > 0
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
          <div className='grid grid-cols-2 gap-2'>
            <div className='min-w-0'>
              <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.pickupDate')}</label>
              <MySelect
                data={pickupDateOptions}
                value={pickupDate}
                search={false}
                placeholder={translate('common.select')}
                onChange={(item) => handlePickupDateChange(item.value as string)}
                className='text-sm'
                style={{ width: '100%' }}
              />
            </div>
            <div className='min-w-0'>
              <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.pickupTime')}</label>
              <MySelect
                data={pickupSlotOptions}
                value={pickupSlot}
                search={false}
                placeholder={translate('common.select')}
                disabled={!pickupDate}
                onChange={(item) => handlePickupSlotChange(item.value as string)}
                className='text-sm'
                style={{ width: '100%' }}
              />
            </div>
          </div>
          {isPickupMoved ? (
            <p className='mt-1 text-xs font-medium text-amber-700'>{translate('chat.laundryForm.pickupMoved')}</p>
          ) : (
            <p className='mt-1 text-xs text-gray-500'>{translate('chat.laundryForm.pickupHint', openingHours)}</p>
          )}
        </div>

        <div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='min-w-0'>
              <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.returnDate')}</label>
              <MySelect
                data={returnDateOptions}
                value={returnDate}
                search={false}
                placeholder={translate('common.select')}
                onChange={(item) => handleReturnDateChange(item.value as string)}
                className='text-sm'
                style={{ width: '100%' }}
              />
            </div>
            <div className='min-w-0'>
              <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.returnTime')}</label>
              <MySelect
                data={returnSlotOptions}
                value={returnSlot}
                search={false}
                placeholder={translate('common.select')}
                disabled={!returnDate}
                onChange={(item) => onChange('returnSlot', item.value as string)}
                className='text-sm'
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <p className='mt-1 text-xs text-gray-500'>{translate('chat.laundryForm.returnHint', { hours: WASH_DURATION_HOURS })}</p>
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
          <p className='mt-1 text-xs text-gray-500'>
            {translate('chat.laundryForm.washTimeHint', {
              link: (text) => (
                // New tab: in the mobile chat drawer a same-tab route change would hide behind the drawer
                <Link
                  href='/pricing'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-primary underline-offset-2 hover:underline'
                >
                  {text}
                </Link>
              ),
            })}
          </p>
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
          <p className='mt-1 text-xs text-gray-500'>{translate('chat.laundryForm.weightHint')}</p>
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
          <label
            className={cn(
              'flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-3 transition-colors',
              hasWeight ? 'cursor-pointer hover:bg-accent/15' : 'cursor-not-allowed opacity-70'
            )}
          >
            <input
              type='checkbox'
              checked={usePoints && hasWeight}
              disabled={!hasWeight}
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
              <span className='block text-xs text-gray-500'>{translate(hasWeight ? 'booking.points.deductNote' : 'booking.points.needWeight')}</span>
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
            <p className='text-xs text-gray-500'>{translate('chat.laundryForm.priceHint')}</p>
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
