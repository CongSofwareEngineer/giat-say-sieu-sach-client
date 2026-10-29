'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import useNotifications from '@/hooks/useNotifications'
import useUser from '@/hooks/useUser'
import useLanguage from '@/hooks/useLanguage'
import UserService from '@/services/users'
import MyButton from '@/components/MyButton'
import { toast as toastStore } from '@/zustand/toast'
import { QUERY_KEYS } from '@/constants/reactQuery'

const NotificationProvider = () => {
  const { translate } = useLanguage()
  const queryClient = useQueryClient()
  const { isLogin, hasHydrated } = useUser()
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'>('idle')
  const { permission, isSupported, requestPermission, getFid, getStoredFid, onMessage } = useNotifications(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported')

      return
    }

    if (permission === 'granted') {
      getFid()
        .then((fid) => {
          setStatus(fid ? 'granted' : 'idle')
        })
        .catch(() => {
          setStatus('idle')
        })
    } else if (permission === 'denied') {
      setStatus('denied')
    }
  }, [isSupported, permission, getFid])

  useEffect(() => {
    if (!isSupported || !hasHydrated || !isLogin) {
      return
    }

    const storedFid = getStoredFid()

    if (!storedFid) {
      return
    }

    UserService.updateFcmFid(storedFid).catch(() => {
      // Silent fail for FCM FID sync
    })
  }, [isSupported, hasHydrated, isLogin, getStoredFid])

  useEffect(() => {
    if (!isSupported) {
      return
    }

    const unsubscribe = onMessage((payload) => {
      const { title, body } = payload.notification || {}

      // A push usually means a new bell entry (e.g. order status changed)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getNotifications] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getMyOrders] })

      if (title || body) {
        toastStore.getState().addToast({
          message: [title, body].filter(Boolean).join('\n'),
          type: 'default',
          duration: 5000,
        })
      }
    })

    return unsubscribe
  }, [isSupported, onMessage, queryClient])

  const handleRequestPermission = async () => {
    setStatus('loading')

    try {
      const result = await requestPermission()

      if (result === 'granted') {
        const fid = await getFid()

        if (fid) {
          setStatus('granted')

          if (isLogin) {
            UserService.updateFcmFid(fid).catch(() => {
              // Silent fail for FCM FID sync
            })
          }
        } else {
          setStatus('idle')
        }
      } else {
        setStatus('denied')
      }
    } catch {
      setStatus('idle')
    }
  }

  if (!isSupported || status === 'granted' || status === 'denied' || status === 'unsupported') {
    return null
  }

  if (status === 'loading') {
    return (
      <div className='fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-border bg-white p-4 shadow-lg'>
        <p className='text-sm text-gray-600'>{translate('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-border bg-white p-4 shadow-lg'>
      <div className='flex items-start gap-3'>
        <div className='flex-1'>
          <h3 className='text-sm font-semibold text-text'>{translate('notification.requestPermission.title')}</h3>
          <p className='mt-1 text-xs text-gray-600'>{translate('notification.requestPermission.message')}</p>
        </div>
      </div>
      <div className='mt-3 flex gap-2'>
        <MyButton size='small' onClick={handleRequestPermission}>
          {translate('notification.requestPermission.allowButton')}
        </MyButton>
        <MyButton size='small' variant='outline' onClick={() => setStatus('denied')}>
          {translate('notification.requestPermission.denyButton')}
        </MyButton>
      </div>
    </div>
  )
}

export default NotificationProvider

export const showToast = {
  default: (message: string) =>
    toastStore.getState().addToast({
      message,
      type: 'default',
      duration: 4000,
    }),
  warning: (message: string) =>
    toastStore.getState().addToast({
      message,
      type: 'warning',
      duration: 5000,
    }),
  error: (message: string) =>
    toastStore.getState().addToast({
      message,
      type: 'error',
      duration: 6000,
    }),
}
