import { NextResponse } from 'next/server'

import { firebaseConfig } from '@/config/firebase'

export async function GET() {
  const js = `
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js')

firebase.initializeApp({
  apiKey: '${firebaseConfig.apiKey}',
  authDomain: '${firebaseConfig.authDomain}',
  projectId: '${firebaseConfig.projectId}',
  storageBucket: '${firebaseConfig.storageBucket}',
  messagingSenderId: '${firebaseConfig.messagingSenderId}',
  appId: '${firebaseConfig.appId}',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  if (payload?.data?.message) {
    self.registration.showNotification(payload?.data?.message, {
      body: '',
      icon: './logo.png',
    })
  }
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
        })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) return client.focus()
          }
          if (clients.openWindow) {
            // Pushes with webpush.fcmOptions.link are opened by the Firebase SDK itself; this handles the rest
            const data = event.notification?.data?.FCM_MSG?.data ?? event.notification?.data ?? {}
            return clients.openWindow(data.link ?? self.location.origin)
          }
        })
    )
  })
`

  return new NextResponse(js, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
    },
  })
}
