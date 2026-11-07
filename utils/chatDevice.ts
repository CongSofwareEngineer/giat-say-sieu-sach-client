import { LOCAL_STORAGE_KEY } from '@/constants/app'

let memoryDeviceId: string | null = null

// Random id of this device, created once and kept in localStorage so each device has its own chat
export const getChatDeviceId = (): string => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY.chatDeviceId)

    if (saved) return saved

    const deviceId = crypto.randomUUID()

    localStorage.setItem(LOCAL_STORAGE_KEY.chatDeviceId, deviceId)

    return deviceId
  } catch {
    // Storage blocked: keep one id for this page session
    memoryDeviceId ??= crypto.randomUUID()

    return memoryDeviceId
  }
}
