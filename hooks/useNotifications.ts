import type { MessagePayload } from 'firebase/messaging'

import { useCallback, useEffect, useRef, useState } from 'react'

import { LOCAL_STORAGE_KEY } from '@/constants/app'
import { initNotificationService } from '@/services/notification'

interface UseNotificationsReturn {
  permission: NotificationPermission | null
  fid: string | null
  isSupported: boolean
  requestPermission: () => Promise<NotificationPermission>
  getFid: () => Promise<string | null>
  onMessage: (callback: (payload: MessagePayload) => void) => () => void
  getStoredFid: () => string | null
  clearFid: () => void
}

// Read the device FID saved by the last successful FCM register
export const getStoredFcmFid = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return localStorage.getItem(LOCAL_STORAGE_KEY.fcmFid)
  } catch {
    return null
  }
}

const useNotifications = (vapidKey?: string): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [fid, setFid] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const serviceRef = useRef<ReturnType<typeof initNotificationService> | null>(null)

  useEffect(() => {
    if (!vapidKey) {
      return
    }

    const service = initNotificationService(vapidKey)

    serviceRef.current = service

    // Persist every FID Firebase delivers (first register and later rotations)
    service.setFidListener((registeredFid) => {
      setFid(registeredFid)

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY.fcmFid, registeredFid)
      } catch {
        // Storage blocked: the FID is still kept in state for this session
      }
    })

    return () => service.setFidListener(null)
  }, [vapidKey])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const isNotificationSupported = 'Notification' in window && 'serviceWorker' in navigator

    if (!isNotificationSupported) {
      return
    }

    setIsSupported(true)
    setPermission(Notification.permission)

    const storedFid = getStoredFcmFid()

    if (storedFid) {
      setFid(storedFid)
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {
        // Silent fail for service worker registration
      })
    }
  }, [])

  const getStoredFid = useCallback((): string | null => getStoredFcmFid(), [])

  const clearFid = useCallback((): void => {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY.fcmFid)
    setFid(null)
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const service = serviceRef.current

    if (!service) {
      return 'denied'
    }

    const result = await service.requestPermission()

    setPermission(result)

    return result
  }, [])

  // The FID is saved by the listener above, this only triggers the register
  const getFid = useCallback(async (): Promise<string | null> => {
    const service = serviceRef.current

    if (!service) {
      return null
    }

    return service.getFid()
  }, [])

  const onMessage = useCallback((callback: (payload: MessagePayload) => void): (() => void) => {
    const service = serviceRef.current

    if (!service) {
      return () => {}
    }

    return service.onMessage(callback)
  }, [])

  return {
    permission,
    fid,
    isSupported,
    requestPermission,
    getFid,
    onMessage,
    getStoredFid,
    clearFid,
  }
}

export default useNotifications
