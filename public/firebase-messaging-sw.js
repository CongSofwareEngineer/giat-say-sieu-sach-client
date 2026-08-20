importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: '${NEXT_PUBLIC_FIREBASE_API_KEY}',
  authDomain: '${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}',
  projectId: '${NEXT_PUBLIC_FIREBASE_PROJECT_ID}',
  storageBucket: '${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}',
  messagingSenderId: '${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}',
  appId: '${NEXT_PUBLIC_FIREBASE_APP_ID}',
  measurementId: '${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Thông báo mới'
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
  }
  if (payload.data?.titleConfirm) {
    notificationOptions.actions = [
      {
        action: 'action',
        title: payload.data?.titleConfirm || 'Confirm'
      }
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)

  self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
      clients
        .matchAll({
          type: 'window'
        })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) return client.focus()
          }
          if (clients.openWindow) {
            return clients.openWindow(payload.data?.link_confirm ?? 'http://giatsaysieusach.vercel.app/')
          }
        })
    )
  })

})
