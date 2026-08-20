import type { MessagePayload } from 'firebase/messaging'

import { useEffect, useRef, useState } from 'react'

import { initNotificationService } from '@/services/notification'

interface UseNotificationsReturn {
  permission: NotificationPermission | null
  token: string | null
  isSupported: boolean
  requestPermission: () => Promise<NotificationPermission>
  getFCMToken: () => Promise<string | null>
  onMessage: (callback: (payload: MessagePayload) => void) => () => void
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
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

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
  }
}

export default useNotifications
