import { onMessage, onRegistered, register, type MessagePayload, type Messaging } from 'firebase/messaging'

import BaseAPI from '@/config/baseApi'
import { getFirebaseMessaging } from '@/config/firebase'
import { NOTIFICATION_TYPE, ORDER_STATUS } from '@/constants/app'

// In-app notification saved by the server (Header bell)
export type InboxNotification = {
  id: string
  type: NOTIFICATION_TYPE
  data: { orderId?: string; orderCode?: string; status?: ORDER_STATUS }
  isRead: boolean
  createdAt: string
}

export type InboxNotificationList = {
  data: InboxNotification[]
  meta: { page: number; limit: number; total: number; totalPages: number; unreadCount: number }
}

class NotificationInboxApi extends BaseAPI {
  async getMine(params?: { page?: number; limit?: number }): Promise<InboxNotificationList> {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    const response = await this.get<InboxNotificationList>(`/me${query.toString() ? `?${query.toString()}` : ''}`, { isUseAuth: true })

    return { data: response.data ?? [], meta: response.meta }
  }

  async markRead(id: string): Promise<InboxNotification> {
    const response = await this.patch<{ data: InboxNotification }>(`/me/${id}/read`, {}, { isUseAuth: true })

    return response.data
  }

  async markAllRead(): Promise<void> {
    await this.patch<{ data: { modifiedCount: number } }>('/me/read-all', {}, { isUseAuth: true })
  }
}

export const NotificationInboxService = new NotificationInboxApi('notifications')

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
