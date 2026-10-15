import dayjs, { type Dayjs } from 'dayjs'

import { BOOKING_SOURCE, INPUT_DATE_FORMAT, PICKUP_LEAD_HOURS, PICKUP_MAX_DAYS_AHEAD, DISPLAY_DATE_FORMAT, PICKUP_TIME_SLOTS } from '@/constants/app'
import { FCM_TOKEN_KEY } from '@/hooks/useNotifications'
import OrderService, { OrderItem } from '@/services/order'
import { formatPhoneToE164 } from '@/utils/phone'
import { translate } from '@/utils/language'

export type LaundryBookingInput = {
  name: string
  phone: string
  address: string
  district: string
  city: string
  planId: string
  planName: string
  weight: number
  // False when the customer left the weight empty and `weight` is only a placeholder
  isWeightEstimated?: boolean
  // Pickup date (INPUT_DATE_FORMAT) + slot key, written into the order notes (the API has no field for it)
  pickupDate?: string
  pickupSlot?: string
  // Free note for the admin
  note?: string
  source?: BOOKING_SOURCE
  // Redeem loyalty points (logged-in customers only)
  usePoints?: boolean
}

// Order notes prefix per booking source
const SOURCE_LABEL_KEY: Record<BOOKING_SOURCE, string> = {
  [BOOKING_SOURCE.CHAT]: 'chat.serviceTypeLabel',
  [BOOKING_SOURCE.PAGE]: 'booking.serviceTypeLabel',
}

export type PickupSlot = (typeof PICKUP_TIME_SLOTS)[number]

export const getPickupSlotKey = (slot: PickupSlot): string => `${slot.start}-${slot.end}`

export const findPickupSlot = (key: string): PickupSlot | undefined => PICKUP_TIME_SLOTS.find((slot) => getPickupSlotKey(slot) === key)

// Slots of a day that start at least PICKUP_LEAD_HOURS from now
export const getAvailablePickupSlots = (date: string, now: Dayjs = dayjs()): PickupSlot[] => {
  const day = dayjs(date)
  const earliest = now.add(PICKUP_LEAD_HOURS, 'hour')

  return PICKUP_TIME_SLOTS.filter((slot) => !day.hour(slot.start).startOf('hour').isBefore(earliest))
}

// Bookable pickup days from today, skipping days with no slot left
export const getPickupDates = (now: Dayjs = dayjs()): string[] =>
  Array.from({ length: PICKUP_MAX_DAYS_AHEAD }, (_, i) => now.add(i, 'day').format(INPUT_DATE_FORMAT)).filter(
    (date) => getAvailablePickupSlots(date, now).length > 0
  )

// Earliest available slot, prefilled so the customer only changes it when needed
export const getDefaultPickup = (now: Dayjs = dayjs()): { pickupDate: string; pickupSlot: string } => {
  const pickupDate = getPickupDates(now)[0] ?? ''
  const slot = pickupDate ? getAvailablePickupSlots(pickupDate, now)[0] : undefined

  return { pickupDate, pickupSlot: slot ? getPickupSlotKey(slot) : '' }
}

export const isPickupValid = (date: string, slotKey: string, now: Dayjs = dayjs()): boolean =>
  !!date && getAvailablePickupSlots(date, now).some((slot) => getPickupSlotKey(slot) === slotKey)

// Weight is only an estimate: empty is fine, a typed value must be positive
export const isWeightValid = (weight: string): boolean => !weight.trim() || parseFloat(weight) > 0

// "14:00 – 16:00, 15/10/2026", empty when no valid slot was picked
export const formatPickupTime = (pickupDate?: string, pickupSlot?: string): string => {
  const slot = pickupSlot ? findPickupSlot(pickupSlot) : undefined

  if (!pickupDate || !slot) return ''

  return translate('booking.pickup.time', {
    slot: translate('booking.pickup.slot', { start: slot.start, end: slot.end }),
    date: dayjs(pickupDate).format(DISPLAY_DATE_FORMAT),
  })
}

const getStoredFcmToken = (): string | undefined => {
  try {
    return localStorage.getItem(FCM_TOKEN_KEY) || undefined
  } catch {
    return undefined
  }
}

// Place a laundry order from the chat form or the booking page. No login needed: the server finds
// (or registers) the customer by phone and stores the address on the order.
// Redeeming points needs the authenticated endpoint, since the guest one cannot prove who owns the points.
export const createLaundryBooking = async (input: LaundryBookingInput): Promise<OrderItem> => {
  const items = [{ categoryId: input.planId, quantity: input.weight }]
  const pickupTime = formatPickupTime(input.pickupDate, input.pickupSlot)
  const notes = [
    translate(SOURCE_LABEL_KEY[input.source ?? BOOKING_SOURCE.CHAT], { serviceType: input.planName }),
    pickupTime && translate('booking.pickup.note', { time: pickupTime }),
    input.isWeightEstimated === false ? translate('booking.weightNotEstimated') : '',
    input.note?.trim(),
  ]
    .filter(Boolean)
    .join('\n')

  if (input.usePoints) {
    // The order is tied to the account, so keep the contact typed in the form for the admin
    const contactNote = translate('booking.contactNote', { name: input.name.trim(), phone: input.phone.trim() })

    return OrderService.createOrder({
      address: input.address.trim(),
      district: input.district,
      city: input.city,
      items,
      notes: [notes, contactNote].join('\n'),
      usePoints: true,
    })
  }

  return OrderService.createGuestOrder({
    phone: formatPhoneToE164(input.phone) ?? input.phone,
    name: input.name.trim(),
    notificationToken: getStoredFcmToken(),
    address: input.address.trim(),
    district: input.district,
    city: input.city,
    items,
    notes,
  })
}
