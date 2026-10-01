import type { ChatMessage } from '@/zustand/chat'

export type { ChatMessage }

export type LaundryFormData = {
  name: string
  phone: string
  addressId: string
  // Street / house number, typed by the user
  address: string
  // Ward (phường/xã), picked from LocationApi
  district: string
  // Province (tỉnh/thành phố), picked from LocationApi
  city: string
  serviceType: string
  weight: string
}

export type TranslateFn = (key?: string, variables?: Record<string, any>, defaultMessage?: string) => any

// Service names for display
export const LAUNDRY_SERVICE_NAMES: Record<string, string> = {
  'quan-ao': 'Quần áo thường',
  'chan-mem': 'Chăn mền',
  'vest-ao-dai': 'Vest/Áo dài (giặt khô)',
  'giat-nhanh': 'Giặt nhanh',
  'giat-ui': 'Giặt + Ủi',
}
