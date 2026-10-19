'use server'

import type { Auth } from '@/services/auth/type'

import AuthService from '@/services/auth'
import { setCookie } from '@/utils/cookie'
import { COOKIES_KEY } from '@/constants/cookies'

export async function loginAction(phone: string, password: string, rememberMe: boolean = true) {
  const response = await AuthService.login(phone, password)

  await saveAuthCookies(response, rememberMe)

  return response
}

// Store the access/refresh tokens in httpOnly cookies (shared by login and register).
// Not remembered -> session cookies (no maxAge), gone when the browser closes.
export async function saveAuthCookies(auth: Auth, rememberMe: boolean = true) {
  const accessExpireInSeconds = parseExpireToSeconds(auth.accessExpire)

  const refreshExpireInSeconds = parseExpireToSeconds(auth.refreshExpire)

  await setCookie(COOKIES_KEY.accessToken, auth.accessToken, rememberMe ? accessExpireInSeconds : undefined)
  await setCookie(COOKIES_KEY.refreshToken, auth.refreshToken, rememberMe ? refreshExpireInSeconds : undefined)
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
