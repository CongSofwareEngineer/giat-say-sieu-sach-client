import { User } from '../users/type'

import { Auth } from './type'

import BaseAPI from '@/config/baseApi'

class AuthApi extends BaseAPI {
  async login(phone: string, password: string): Promise<Auth & { user: User }> {
    const response = await this.post<{ data: Auth & { user: User } }>('/login', { phone, password }, { isUseAuth: false })

    return response.data
  }

  async register(name: string, phone: string, password: string, captchaToken?: string): Promise<Auth & { user: User }> {
    const response = await this.post<{ data: Auth & { user: User } }>('/register', { name, phone, password, captchaToken }, { isUseAuth: false })

    return response.data
  }
}

const AuthService = new AuthApi('auth')

export default AuthService
