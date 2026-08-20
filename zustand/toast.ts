import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'

export interface Toast {
  id: number
  message: string
  type?: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: number) => void
}

export const toast = create<ToastState>()(
  devtools(
    (set, get) => ({
      toasts: [],
      addToast: (param) => {
        const id = Date.now() + Math.random()
        const newToast = { id, duration: 5000, ...param }

        set({ toasts: [...get().toasts, newToast] })
      },
      removeToast: (id) => {
        set({ toasts: get().toasts.filter((item) => item.id !== id) })
      },
    }),
    {
      name: 'toast-zustand',
      enabled: !IS_PRODUCTION,
    }
  )
)
