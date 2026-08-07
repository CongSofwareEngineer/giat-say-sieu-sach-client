'use server'
import { cookies } from 'next/headers'

import { IS_PRODUCTION } from '@/constants/app'
import { COOKIES_KEY } from '@/constants/cookies'

export async function getCookie(name: COOKIES_KEY): Promise<string | null> {
  const cookieStore = await cookies()

  return cookieStore.get(name)?.value || null
}

export async function setCookie(name: COOKIES_KEY, value: string, maxAgeInSeconds?: number): Promise<void> {
  const cookieStore = await cookies()
  const options: Record<string, unknown> = {
    path: '/',
    // Keep tokens out of reach of client-side scripts (XSS mitigation)
    httpOnly: true,
    sameSite: 'lax',
    ...(IS_PRODUCTION ? { secure: true } : {}),
  }

  if (maxAgeInSeconds) {
    options.maxAge = maxAgeInSeconds
  }

  cookieStore.set(name, value, options)
}

export async function removeCookie(name: COOKIES_KEY): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.delete(name)
}
