'use client'

import { useEffect, useState } from 'react'

import useNotifications from '@/hooks/useNotifications'
import useUser from '@/hooks/useUser'
import useLanguage from '@/hooks/useLanguage'
import UserService from '@/services/users'
import MyButton from '@/components/MyButton'

const NotificationProvider = () => {
  const { translate } = useLanguage()
  const { isLogin, hasHydrated } = useUser()
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'>('idle')
  const { permission, isSupported, requestPermission, getFCMToken, getStoredToken, onMessage } = useNotifications(
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  )

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported')

      return
    }

    if (permission === 'granted') {
      getFCMToken()
        .then((token) => {
          setStatus(token ? 'granted' : 'idle')
        })
        .catch(() => {
          setStatus('idle')
        })
    } else if (permission === 'denied') {
      setStatus('denied')
    }
  }, [isSupported, permission, getFCMToken])

  useEffect(() => {
    if (!isSupported || !hasHydrated || !isLogin) {
      return
    }

    const storedToken = getStoredToken()

    if (!storedToken) {
      return
    }

    UserService.updateFcmToken(storedToken).catch(() => {
      // Silent fail for FCM token sync
    })
  }, [isSupported, hasHydrated, isLogin, getStoredToken])

  useEffect(() => {
    if (!isSupported) {
      return
    }

    const unsubscribe = onMessage((payload) => {
      const { title, body } = payload.notification || {}

      if (title && body && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        })
      }
    })

    return unsubscribe
  }, [isSupported, onMessage])

  const handleRequestPermission = async () => {
    setStatus('loading')

    try {
      const result = await requestPermission()

      if (result === 'granted') {
        const token = await getFCMToken()

        if (token) {
          setStatus('granted')

          if (isLogin) {
            UserService.updateFcmToken(token).catch(() => {
              // Silent fail for FCM token sync
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
