'use server'

import AuthService from '@/services/auth'
import { setCookie } from '@/utils/cookie'
import { COOKIES_KEY } from '@/constants/cookies'

export async function loginAction(phone: string, password: string) {
  const response = await AuthService.login(phone, password)

  const accessExpireInSeconds = parseExpireToSeconds(response.accessExpire)

  const refreshExpireInSeconds = parseExpireToSeconds(response.refreshExpire)

  await setCookie(COOKIES_KEY.accessToken, response.accessToken, accessExpireInSeconds)
  await setCookie(COOKIES_KEY.refreshToken, response.refreshToken, refreshExpireInSeconds)

  return response
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
