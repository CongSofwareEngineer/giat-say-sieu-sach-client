'use server'
import { cookies } from 'next/headers'

export async function getCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies()

  return cookieStore.get(name)?.value || null
}

export async function setCookie(name: string, value: string, maxAgeInSeconds?: number): Promise<void> {
  const cookieStore = await cookies()
  const options: Record<string, unknown> = { path: '/' }

  if (maxAgeInSeconds) {
    options.maxAge = maxAgeInSeconds
  }

  cookieStore.set(name, value, options)
}

export async function removeCookie(name: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.delete(name)
}
