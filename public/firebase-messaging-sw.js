importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: 'AIzaSyBwplEBaz1E7APmjM8w1r9MbpDUyZ7yU84',
  authDomain: 'giat-say-sieu-sach.firebaseapp.com',
  projectId: 'giat-say-sieu-sach',
  storageBucket: 'giat-say-sieu-sach.firebasestorage.app',
  messagingSenderId: '1040820161906',
  appId: '1:1040820161906:web:f0d3169fb0cb1b02f5e1eb',
  measurementId: 'G-QYD8TPDN7Z',
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
