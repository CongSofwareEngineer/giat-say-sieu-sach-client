'use server'

import { saveAuthCookies } from '../login/actions'

import AuthService from '@/services/auth'

// Register, then log the new customer in right away with the returned tokens
export async function registerAction(name: string, phone: string, password: string, captchaToken?: string, referralCode?: string) {
  const response = await AuthService.register(name, phone, password, captchaToken, referralCode)

  // Older servers return only the user (no tokens): the page then sends the customer to /login
  if (response?.accessToken) await saveAuthCookies(response)

  return response
}
