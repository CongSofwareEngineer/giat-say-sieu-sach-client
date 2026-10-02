import { LOCAL_STORAGE_KEY } from '@/constants/app'

// Contact + address of the last successful booking, reused to prefill the next one
export type SavedBookingAddress = {
  name: string
  phone: string
  address: string
  district: string
  city: string
}

export const getSavedBookingAddress = (): SavedBookingAddress | null => {
  if (typeof window === 'undefined') return null

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY.bookingAddress)

    return saved ? (JSON.parse(saved) as SavedBookingAddress) : null
  } catch {
    return null
  }
}

export const saveBookingAddress = (data: SavedBookingAddress): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY.bookingAddress, JSON.stringify(data))
  } catch {}
}
