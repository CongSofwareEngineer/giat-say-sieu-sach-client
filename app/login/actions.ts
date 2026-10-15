'use server'

import type { Auth } from '@/services/auth/type'

import AuthService from '@/services/auth'
import { setCookie } from '@/utils/cookie'
import { COOKIES_KEY } from '@/constants/cookies'

export async function loginAction(phone: string, password: string) {
  const response = await AuthService.login(phone, password)

  await saveAuthCookies(response)

  return response
}

// Store the access/refresh tokens in httpOnly cookies (shared by login and register)
export async function saveAuthCookies(auth: Auth) {
  const accessExpireInSeconds = parseExpireToSeconds(auth.accessExpire)

  const refreshExpireInSeconds = parseExpireToSeconds(auth.refreshExpire)

  await setCookie(COOKIES_KEY.accessToken, auth.accessToken, accessExpireInSeconds)
  await setCookie(COOKIES_KEY.refreshToken, auth.refreshToken, refreshExpireInSeconds)
}

function parseExpireToSeconds(expire: string): number {
  const value = parseInt(expire)

  if (expire.includes('min')) {
    return value * 60
  }
  if (expire.includes('day')) {
    return value * 24 * 60 * 60
  }

  return value
}
