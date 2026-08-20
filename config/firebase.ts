import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getMessaging, type Messaging } from 'firebase/messaging'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp | null = null
let messaging: Messaging | null = null
let auth: Auth | null = null

// Lazy-init Firebase Auth (client only). Required for phone-number verification.
export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!auth) {
    try {
      auth = getAuth(getFirebaseApp())
    } catch {
      return null
    }
  }

  return auth
}

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
  }

  return app
}

export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!messaging) {
    try {
      messaging = getMessaging(getFirebaseApp())
    } catch {
      return null
    }
  }

  return messaging
}

export default getFirebaseApp
