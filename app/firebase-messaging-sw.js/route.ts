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
            return clients.openWindow('/')
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
