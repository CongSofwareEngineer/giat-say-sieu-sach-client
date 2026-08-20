'use client'

import { useEffect, useState } from 'react'

import { toast as toastStore } from '@/zustand/toast'

const TOAST_STYLES = {
  default: {
    border: 'border-l-primary',
    icon: (
      <svg className='w-5 h-5 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
  },
  warning: {
    border: 'border-l-amber-400',
    icon: (
      <svg className='w-5 h-5 text-amber-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
      </svg>
    ),
  },
  error: {
    border: 'border-l-red-500',
    icon: (
      <svg className='w-5 h-5 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
  },
}

const ToastItem = ({ item }: { item: { id: number; message: string; type?: string; duration?: number } }) => {
  const [isExiting, setIsExiting] = useState(false)
  const removeToast = toastStore((state) => state.removeToast)
  const style = TOAST_STYLES[item.type ?? 'default']

  useEffect(() => {
    const duration = item.duration ?? 5000

    if (duration > 0) {
      const exitTimer = window.setTimeout(() => {
        setIsExiting(true)
      }, duration - 300)

      const removeTimer = window.setTimeout(() => {
        removeToast(item.id)
      }, duration)

      return () => {
        window.clearTimeout(exitTimer)
        window.clearTimeout(removeTimer)
      }
    }
  }, [item.id, item.duration, removeToast])

  return (
    <div
      className={`flex items-start gap-3 bg-white rounded-xl shadow-lg border-l-4 ${style.border} p-4 min-w-[320px] max-w-[400px] ${
        isExiting ? 'animation-toast-out' : 'animation-toast-in'
      }`}
    >
      <div className='flex-shrink-0 mt-0.5'>{style.icon}</div>
      <p className='text-sm text-gray-700 leading-relaxed flex-1'>{item.message}</p>
    </div>
  )
}

const Toast = () => {
  const toasts = toastStore((state) => state.toasts)

  if (!toasts.length) {
    return null
  }

  return (
    <div className='fixed top-5 right-5 z-50 flex flex-col gap-2'>
      {toasts.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  )
}

export default Toast
