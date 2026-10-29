import dayjs, { type Dayjs } from 'dayjs'

import {
  BOOKING_SOURCE,
  HTTP_STATUS,
  INFO_CONTACT,
  INPUT_DATE_FORMAT,
  MAX_ACTIVE_ORDERS_PER_PHONE,
  RECAPTCHA_ACTION,
  PICKUP_LEAD_HOURS,
  PICKUP_MAX_DAYS_AHEAD,
  DISPLAY_DATE_FORMAT,
  PICKUP_TIME_SLOTS,
  WASH_DURATION_HOURS,
} from '@/constants/app'
import { HttpError } from '@/config/baseApi'
import { getStoredFcmFid } from '@/hooks/useNotifications'
import OrderService, { OrderItem } from '@/services/order'
import { formatPhoneToE164 } from '@/utils/phone'
import { translate } from '@/utils/language'
import { getRecaptchaToken } from '@/utils/recaptcha'
import { getStoredReferralCode } from '@/utils/referral'

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
  // Pickup / return date (INPUT_DATE_FORMAT) + slot key, written into the order notes (the API has no field for them)
  pickupDate?: string
  pickupSlot?: string
  returnDate?: string
  returnSlot?: string
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

// Slots of a day that start at or after `earliest`; with `isOngoingAllowed`, the slot running at `earliest` counts too
const getSlotsFrom = (date: string, earliest: Dayjs, isOngoingAllowed = false): PickupSlot[] => {
  const day = dayjs(date)

  return PICKUP_TIME_SLOTS.filter((slot) =>
    isOngoingAllowed ? day.hour(slot.end).startOf('hour').isAfter(earliest) : !day.hour(slot.start).startOf('hour').isBefore(earliest)
  )
}

// PICKUP_MAX_DAYS_AHEAD days from `from`, skipping days with no slot left
const getDatesFrom = (from: Dayjs, earliest: Dayjs, isOngoingAllowed = false): string[] =>
  Array.from({ length: PICKUP_MAX_DAYS_AHEAD }, (_, i) => from.add(i, 'day').format(INPUT_DATE_FORMAT)).filter(
    (date) => getSlotsFrom(date, earliest, isOngoingAllowed).length > 0
  )

const hasSlot = (slots: PickupSlot[], slotKey: string): boolean => slots.some((slot) => getPickupSlotKey(slot) === slotKey)

// Pickup slots of a day that have not ended yet: the slot running now is offered so the shipper comes right away
export const getAvailablePickupSlots = (date: string, now: Dayjs = dayjs()): PickupSlot[] =>
  getSlotsFrom(date, now.add(PICKUP_LEAD_HOURS, 'hour'), true)

// Bookable pickup days from today, skipping days with no slot left
export const getPickupDates = (now: Dayjs = dayjs()): string[] => getDatesFrom(now, now.add(PICKUP_LEAD_HOURS, 'hour'), true)

export const isPickupValid = (date: string, slotKey: string, now: Dayjs = dayjs()): boolean =>
  !!date && hasSlot(getAvailablePickupSlots(date, now), slotKey)

// Earliest return time: the pickup slot start + WASH_DURATION_HOURS, null without a valid pickup slot
const getEarliestReturn = (pickupDate: string, pickupSlot: string): Dayjs | null => {
  const slot = findPickupSlot(pickupSlot)

  return pickupDate && slot ? dayjs(pickupDate).hour(slot.start).startOf('hour').add(WASH_DURATION_HOURS, 'hour') : null
}

// Return slots of a day that start at least WASH_DURATION_HOURS after the pickup slot
export const getAvailableReturnSlots = (date: string, pickupDate: string, pickupSlot: string): PickupSlot[] => {
  const earliest = getEarliestReturn(pickupDate, pickupSlot)

  return earliest ? getSlotsFrom(date, earliest) : []
}

// Return days listed from the pickup day, skipping days with no slot left after the gap
export const getReturnDates = (pickupDate: string, pickupSlot: string): string[] => {
  const earliest = getEarliestReturn(pickupDate, pickupSlot)

  return earliest ? getDatesFrom(dayjs(pickupDate), earliest) : []
}

export const isReturnValid = (date: string, slotKey: string, pickupDate: string, pickupSlot: string): boolean =>
  !!date && hasSlot(getAvailableReturnSlots(date, pickupDate, pickupSlot), slotKey)

// Earliest return slot for a pickup slot (same day when one is left)
export const getDefaultReturn = (pickupDate: string, pickupSlot: string): { returnDate: string; returnSlot: string } => {
  const returnDate = getReturnDates(pickupDate, pickupSlot)[0] ?? ''
  const slot = returnDate ? getAvailableReturnSlots(returnDate, pickupDate, pickupSlot)[0] : undefined

  return { returnDate, returnSlot: slot ? getPickupSlotKey(slot) : '' }
}

// Current pickup slot (or the next one when the shop is closed) + its earliest return slot, prefilled so the customer only changes them when needed
export const getDefaultPickup = (now: Dayjs = dayjs()): { pickupDate: string; pickupSlot: string; returnDate: string; returnSlot: string } => {
  const pickupDate = getPickupDates(now)[0] ?? ''
  const slot = pickupDate ? getAvailablePickupSlots(pickupDate, now)[0] : undefined
  const pickupSlot = slot ? getPickupSlotKey(slot) : ''

  return { pickupDate, pickupSlot, ...getDefaultReturn(pickupDate, pickupSlot) }
}

// Weight is only an estimate: empty is fine, a typed value must be positive
export const isWeightValid = (weight: string): boolean => !weight.trim() || parseFloat(weight) > 0

// "14:00 – 17:00, 15/10/2026" (pickup or return), empty when no valid slot was picked
export const formatPickupTime = (pickupDate?: string, pickupSlot?: string): string => {
  const slot = pickupSlot ? findPickupSlot(pickupSlot) : undefined

  if (!pickupDate || !slot) return ''

  return translate('booking.pickup.time', {
    slot: translate('booking.pickup.slot', { start: slot.start, end: slot.end }),
    date: dayjs(pickupDate).format(DISPLAY_DATE_FORMAT),
  })
}

// Place a laundry order from the chat form or the booking page. No login needed: the server finds
// (or registers) the customer by phone and stores the address on the order.
// Redeeming points needs the authenticated endpoint, since the guest one cannot prove who owns the points.
export const createLaundryBooking = async (input: LaundryBookingInput): Promise<OrderItem> => {
  const items = [{ categoryId: input.planId, quantity: input.weight }]
  const pickupTime = formatPickupTime(input.pickupDate, input.pickupSlot)
  const returnTime = formatPickupTime(input.returnDate, input.returnSlot)
  const notes = [
    translate(SOURCE_LABEL_KEY[input.source ?? BOOKING_SOURCE.CHAT], { serviceType: input.planName }),
    pickupTime && translate('booking.pickup.note', { time: pickupTime }),
    returnTime && translate('booking.pickup.returnNote', { time: returnTime }),
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
    notificationFid: getStoredFcmFid() || undefined,
    address: input.address.trim(),
    district: input.district,
    city: input.city,
    items,
    notes,
    captchaToken: await getRecaptchaToken(RECAPTCHA_ACTION.GUEST_ORDER),
    referralCode: getStoredReferralCode(),
  })
}

// Message for a failed booking: 429 = the phone already has too many unfinished orders, or too many bookings from this device
export const getBookingErrorMessage = (error: unknown, fallbackKey: string): string =>
  error instanceof HttpError && error.status === HTTP_STATUS.TOO_MANY_REQUESTS
    ? translate('booking.tooManyOrders', { max: MAX_ACTIVE_ORDERS_PER_PHONE, phone: INFO_CONTACT.Phone })
    : translate(fallbackKey)
