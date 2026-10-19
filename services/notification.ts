import { onMessage, onRegistered, register, type MessagePayload, type Messaging } from 'firebase/messaging'

import { getFirebaseMessaging } from '@/config/firebase'

class NotificationService {
  private vapidKey: string
  private fid: string | null = null
  private isRegisteredHandlerAttached = false
  private fidListener: ((fid: string) => void) | null = null

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

  // Called with every FID Firebase delivers, including a rotated FID after the first register
  setFidListener(listener: ((fid: string) => void) | null): void {
    this.fidListener = listener
  }

  // Register the device with FCM by Firebase Installation ID; the FID arrives via onRegistered
  async getFid(): Promise<string | null> {
    const messaging = getFirebaseMessaging()

    if (!messaging) {
      return null
    }

    this.attachRegisteredHandler(messaging)

    try {
      await register(messaging, { vapidKey: this.vapidKey })

      return this.fid
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

  // Keep one handler for the app lifetime so Firebase can re-register when the FID rotates
  private attachRegisteredHandler(messaging: Messaging): void {
    if (this.isRegisteredHandlerAttached) {
      return
    }

    onRegistered(messaging, (fid) => {
      this.fid = fid
      this.fidListener?.(fid)
    })

    this.isRegisteredHandlerAttached = true
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
