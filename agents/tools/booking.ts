import { BOOKING_SOURCE } from '@/constants/app'
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
  const notes = [translate(SOURCE_LABEL_KEY[input.source ?? BOOKING_SOURCE.CHAT], { serviceType: input.planName }), input.note?.trim()]
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
