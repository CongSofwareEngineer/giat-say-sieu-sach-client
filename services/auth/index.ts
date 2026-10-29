import { User } from '../users/type'

import { Auth, GoogleLoginResponse } from './type'

import BaseAPI from '@/config/baseApi'

class AuthApi extends BaseAPI {
  async login(phone: string, password: string): Promise<Auth & { user: User }> {
    const response = await this.post<{ data: Auth & { user: User } }>('/login', { phone, password }, { isUseAuth: false })

    return response.data
  }

  // referralCode: from the last `?ref=` link, only used by the server when the account is new
  async register(name: string, phone: string, password: string, captchaToken?: string, referralCode?: string): Promise<Auth & { user: User }> {
    const response = await this.post<{ data: Auth & { user: User } }>(
      '/register',
      { name, phone, password, captchaToken, referralCode },
      { isUseAuth: false }
    )

    return response.data
  }

  // Sign in with Google (Firebase ID token); phone/password only for the first-time steps
  async loginWithGoogle(idToken: string, phone?: string, password?: string, referralCode?: string): Promise<GoogleLoginResponse> {
    const response = await this.post<{ data: GoogleLoginResponse }>('/google', { idToken, phone, password, referralCode }, { isUseAuth: false })

    return response.data
  }

  // Server emails an OTP when the account has an email; the response is the same either way
  async forgotPassword(phone: string, captchaToken?: string): Promise<void> {
    await this.post<{ data: null }>('/forgot-password', { phone, captchaToken }, { isUseAuth: false })
  }

  async resetPassword(phone: string, otp: string, newPassword: string): Promise<void> {
    await this.post<{ data: null }>('/reset-password', { phone, otp, newPassword }, { isUseAuth: false })
  }
}

const AuthService = new AuthApi('auth')

export default AuthService
