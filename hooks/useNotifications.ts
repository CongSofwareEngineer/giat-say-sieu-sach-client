import type { MessagePayload } from 'firebase/messaging'

import { useEffect, useRef, useState } from 'react'

import { initNotificationService } from '@/services/notification'

const FCM_TOKEN_KEY = 'fcm_token'

interface UseNotificationsReturn {
  permission: NotificationPermission | null
  token: string | null
  isSupported: boolean
  requestPermission: () => Promise<NotificationPermission>
  getFCMToken: () => Promise<string | null>
  onMessage: (callback: (payload: MessagePayload) => void) => () => void
  getStoredToken: () => string | null
  clearToken: () => void
}

const useNotifications = (vapidKey?: string): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const serviceRef = useRef<ReturnType<typeof initNotificationService> | null>(null)

  useEffect(() => {
    if (vapidKey) {
      serviceRef.current = initNotificationService(vapidKey)
    }
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

    const storedToken = localStorage.getItem(FCM_TOKEN_KEY)

    if (storedToken) {
      setToken(storedToken)
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {
        // Silent fail for service worker registration
      })
    }
  }, [])

  const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem(FCM_TOKEN_KEY)
  }

  const clearToken = (): void => {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.removeItem(FCM_TOKEN_KEY)
    setToken(null)
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    const service = serviceRef.current

    if (!service) {
      return 'denied'
    }

    const result = await service.requestPermission()

    setPermission(result)

    return result
  }

  const getFCMToken = async (): Promise<string | null> => {
    const service = serviceRef.current

    if (!service) {
      return null
    }

    const fcmToken = await service.getToken()

    if (fcmToken) {
      setToken(fcmToken)

      if (typeof window !== 'undefined') {
        localStorage.setItem(FCM_TOKEN_KEY, fcmToken)
      }
    }

    return fcmToken
  }

  const onMessage = (callback: (payload: MessagePayload) => void): (() => void) => {
    const service = serviceRef.current

    if (!service) {
      return () => {}
    }

    return service.onMessage(callback)
  }

  return {
    permission,
    token,
    isSupported,
    requestPermission,
    getFCMToken,
    onMessage,
    getStoredToken,
    clearToken,
  }
}

export default useNotifications
