import { getToken, onMessage, type MessagePayload } from 'firebase/messaging'

import { getFirebaseMessaging } from '@/config/firebase'

class NotificationService {
  private vapidKey: string

  constructor(vapidKey: string) {
    this.vapidKey = vapidKey
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied'
    }

    const permission = await Notification.requestPermission()

    return permission
  }

  async getToken(): Promise<string | null> {
    const messaging = getFirebaseMessaging()

    if (!messaging) {
      return null
    }

    try {
      const token = await getToken(messaging, { vapidKey: this.vapidKey })

      return token
    } catch {
      return null
    }
  }

  onMessage(callback: (payload: MessagePayload) => void): () => void {
    const messaging = getFirebaseMessaging()

    if (!messaging) {
      return () => {}
    }

    const unsubscribe = onMessage(messaging, callback)

    return unsubscribe
  }
}

let notificationService: NotificationService | null = null

export const initNotificationService = (vapidKey: string): NotificationService => {
  if (!notificationService) {
    notificationService = new NotificationService(vapidKey)
  }

  return notificationService
}

export const getNotificationService = (): NotificationService | null => {
  return notificationService
}

export default notificationService
