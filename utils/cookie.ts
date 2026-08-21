'use server'
import { cookies } from 'next/headers'

import { COOKIES_KEY } from '@/constants/cookies'

export async function getCookie(name: COOKIES_KEY): Promise<string | null> {
  const cookieStore = await cookies()

  return cookieStore.get(name)?.value || null
}

export async function setCookie(name: COOKIES_KEY, value: string, maxAgeInSeconds?: number): Promise<void> {
  const cookieStore = await cookies()
  const options: Record<string, unknown> = {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
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
