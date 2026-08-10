import type { ChatMessage } from '@/zustand/chat'

export type { ChatMessage }

export type LaundryFormData = {
  name: string
  phone: string
  address: string
  serviceType: string
  weight: string
}

export type TranslateFn = (
  key?: string,
  variables?: Record<string, any>,
  defaultMessage?: string
) => any

// Pricing configuration for laundry services
export const LAUNDRY_PRICES: Record<string, number> = {
  'quan-ao': 25000,
  'chan-mem': 80000,
  'vest-ao-dai': 80000,
  'giat-nhanh': 40000,
  'giat-ui': 50000,
}

// Service names for display
export const LAUNDRY_SERVICE_NAMES: Record<string, string> = {
  'quan-ao': 'Quần áo thường',
  'chan-mem': 'Chăn mền',
  'vest-ao-dai': 'Vest/Áo dài (giặt khô)',
  'giat-nhanh': 'Giặt nhanh',
  'giat-ui': 'Giặt + Ủi',
}
