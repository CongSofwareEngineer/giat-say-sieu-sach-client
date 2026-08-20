'use client'

import { useEffect, useState } from 'react'

import useNotifications from '@/hooks/useNotifications'
import useLanguage from '@/hooks/useLanguage'
import MyButton from '@/components/MyButton'

const NotificationProvider = () => {
  const { translate } = useLanguage()
  const [isInitialized, setIsInitialized] = useState(false)
  const { permission, isSupported, requestPermission, getFCMToken, onMessage } = useNotifications(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)

  useEffect(() => {
    if (!isSupported || isInitialized) {
      return
    }

    if (permission === 'granted') {
      getFCMToken().then(() => {
        setIsInitialized(true)
      })
    }

    setIsInitialized(true)
  }, [isSupported, permission, getFCMToken, isInitialized])

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
    const result = await requestPermission()

    if (result === 'granted') {
      await getFCMToken()
    }
  }

  if (!isSupported || permission === 'granted') {
    return null
  }

  if (permission === 'denied') {
    return null
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
      </div>
    </div>
  )
}

export default NotificationProvider
