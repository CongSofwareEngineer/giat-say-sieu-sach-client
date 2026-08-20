'use client'

import { useEffect } from 'react'

import { toast as toastStore } from '@/zustand/toast'

const ToastItem = ({ item }: { item: { id: number; message: string; type?: string; duration?: number } }) => {
  const removeToast = toastStore((state) => state.removeToast)

  useEffect(() => {
    const duration = item.duration ?? 5000

    if (duration > 0) {
      const timer = window.setTimeout(() => {
        removeToast(item.id)
      }, duration)

      return () => window.clearTimeout(timer)
    }
  }, [item.id, item.duration, removeToast])

  return (
    <div className={`alert alert-${item.type ?? 'info'}`}>
      <span>{item.message}</span>
    </div>
  )
}

const Toast = () => {
  const toasts = toastStore((state) => state.toasts)

  if (!toasts.length) {
    return null
  }

  return (
    <div className='toast toast-top toast-center z-50'>
      {toasts.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  )
}

export default Toast
