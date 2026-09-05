'use server'

import AuthService from '@/services/auth'
import { setCookie } from '@/utils/cookie'
import { COOKIES_KEY } from '@/constants/cookies'

export async function registerAction(name: string, phone: string, password: string, captchaToken?: string) {
  const response = await AuthService.register(name, phone, password, captchaToken)

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
