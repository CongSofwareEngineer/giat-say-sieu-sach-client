'use client'

import type { LaundryFormData } from '@/components/Chat/types'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { BOOKING_SOURCE, DEFAULT_ESTIMATED_WEIGHT } from '@/constants/app'
import { QUERY_KEYS } from '@/constants/reactQuery'
import useUser from '@/hooks/useUser'
import useGetListAddress from '@/hooks/reactQuery/useGetListAddress'
import PricingService, { PricingPlan } from '@/services/pricing'
import { OrderItem } from '@/services/order'
import { createLaundryBooking, getDefaultPickup, isPickupValid, isReturnValid, isWeightValid } from '@/agents/tools/booking'
import { getSavedBookingAddress, saveBookingAddress } from '@/utils/bookingAddress'
import { calculateOrderPricing } from '@/utils/orderPricing'

export type LaundryBookingResult = {
  order: OrderItem
  plan: PricingPlan
  data: LaundryFormData
  // Final amount charged by the server (after discounts)
  price: number
}

const EMPTY_FORM: LaundryFormData = {
  name: '',
  phone: '',
  addressId: '',
  address: '',
  district: '',
  city: '',
  serviceType: '',
  weight: '',
  pickupDate: '',
  pickupSlot: '',
  returnDate: '',
  returnSlot: '',
  note: '',
}

// Prefer the regular laundry plan, then the first active one
const getDefaultServiceType = (plans: PricingPlan[]): string =>
  plans.find((p) => p.name.toLowerCase().includes('thường'))?.id || plans[0]?.id || 'quan-ao'

const isFormComplete = (data: LaundryFormData): boolean =>
  !!(
    data.name.trim() &&
    data.phone.trim() &&
    data.address.trim() &&
    data.district &&
    data.city &&
    isWeightValid(data.weight) &&
    isPickupValid(data.pickupDate, data.pickupSlot) &&
    isReturnValid(data.returnDate, data.returnSlot, data.pickupDate, data.pickupSlot)
  )

// Shared laundry booking form state + submit, used by the chat form and the booking page
const useLaundryBooking = (source: BOOKING_SOURCE) => {
  const { user, isLogin } = useUser()
  const { addresses, defaultAddress } = useGetListAddress()

  const { data: plans = [] } = useQuery<PricingPlan[]>({
    queryKey: [QUERY_KEYS.getListPrice],
    queryFn: () => PricingService.getPlans(),
    staleTime: 30_000,
  })

  const activePlans = useMemo(() => plans.filter((p) => p.isActive), [plans])
  const planByKey = useMemo(() => new Map(activePlans.map((p) => [p.id, p])), [activePlans])

  // Starts empty so SSR and first client render match, prefilled in an effect below
  const [formData, setFormData] = useState<LaundryFormData>(EMPTY_FORM)
  const [isBooking, setIsBooking] = useState(false)
  const [usePoints, setUsePoints] = useState(false)

  // Points can only be redeemed by a logged-in customer (the server checks it again).
  // They also need a typed weight: with the placeholder kg the server would reserve too few points.
  const pointsBalance = isLogin ? (user?.loyaltyPoints ?? 0) : 0
  const shouldUsePoints = usePoints && pointsBalance > 0 && parseFloat(formData.weight) > 0

  // Logged-in profile + default address first, then the last booking saved locally
  const buildInitialForm = useCallback((): LaundryFormData => {
    const saved = getSavedBookingAddress()
    const addressSource = defaultAddress ?? saved

    return {
      ...EMPTY_FORM,
      name: user?.name || saved?.name || '',
      phone: user?.phone || saved?.phone || '',
      addressId: defaultAddress?.id || '',
      address: addressSource?.address || '',
      district: addressSource?.district || '',
      city: addressSource?.city || '',
      serviceType: getDefaultServiceType(activePlans),
      ...getDefaultPickup(),
    }
  }, [user?.name, user?.phone, defaultAddress, activePlans])

  // Fill only empty fields; the default address replaces a manual/local one unless a saved address is already picked
  useEffect(() => {
    const initial = buildInitialForm()

    setFormData((prev) => {
      const isAddressEmpty = !prev.address && !prev.district && !prev.city
      const shouldFillAddress = !prev.addressId && (!!initial.addressId || isAddressEmpty)

      return {
        ...prev,
        name: prev.name || initial.name,
        phone: prev.phone || initial.phone,
        ...(!prev.pickupDate && {
          pickupDate: initial.pickupDate,
          pickupSlot: initial.pickupSlot,
          returnDate: initial.returnDate,
          returnSlot: initial.returnSlot,
        }),
        ...(shouldFillAddress && { addressId: initial.addressId, address: initial.address, district: initial.district, city: initial.city }),
      }
    })
  }, [])

  // Reset the service when plans load and the current selection is not an active plan
  useEffect(() => {
    if (activePlans.length === 0 || planByKey.has(formData.serviceType)) return

    setFormData((prev) => ({ ...prev, serviceType: getDefaultServiceType(activePlans) }))
  }, [activePlans, planByKey, formData.serviceType])

  const selectedPlan = planByKey.get(formData.serviceType)

  // Estimated amounts with the weight discount and the redeemed points
  const pricing = useMemo(() => {
    const weight = parseFloat(formData.weight)
    const safeWeight = isNaN(weight) || weight <= 0 ? 0 : weight

    return calculateOrderPricing((selectedPlan?.price ?? 25000) * safeWeight, safeWeight, shouldUsePoints ? pointsBalance : 0)
  }, [formData.weight, selectedPlan, shouldUsePoints, pointsBalance])

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData(buildInitialForm())
  }, [buildInitialForm])

  // Create the order, then remember the contact + address locally for the next booking.
  // Returns null when the form is incomplete or no plan matches; throws on API error.
  const submitBooking = useCallback(async (): Promise<LaundryBookingResult | null> => {
    if (isBooking || !selectedPlan) return null

    if (!isFormComplete(formData)) {
      // The picked slots may have expired since the last render: re-render so the form moves them and shows a hint
      if (
        !isPickupValid(formData.pickupDate, formData.pickupSlot) ||
        !isReturnValid(formData.returnDate, formData.returnSlot, formData.pickupDate, formData.pickupSlot)
      )
        setFormData((prev) => ({ ...prev }))

      return null
    }

    setIsBooking(true)

    // No estimate typed: send a placeholder weight, the admin sets the real one after the shipper weighs it
    const estimatedWeight = parseFloat(formData.weight)
    const hasWeight = estimatedWeight > 0

    try {
      const order = await createLaundryBooking({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
        city: formData.city,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        weight: hasWeight ? estimatedWeight : DEFAULT_ESTIMATED_WEIGHT,
        isWeightEstimated: hasWeight,
        pickupDate: formData.pickupDate,
        pickupSlot: formData.pickupSlot,
        returnDate: formData.returnDate,
        returnSlot: formData.returnSlot,
        note: formData.note,
        source,
        usePoints: shouldUsePoints,
      })

      saveBookingAddress({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        district: formData.district,
        city: formData.city,
      })

      setUsePoints(false)

      return { order, plan: selectedPlan, data: formData, price: order.finalAmount ?? pricing.finalAmount }
    } finally {
      setIsBooking(false)
    }
  }, [isBooking, selectedPlan, formData, pricing.finalAmount, source, shouldUsePoints])

  return {
    formData,
    addresses,
    activePlans,
    selectedPlan,
    pricing,
    pointsBalance,
    usePoints: shouldUsePoints,
    setUsePoints,
    isBooking,
    handleChange,
    resetForm,
    submitBooking,
  }
}

export default useLaundryBooking
