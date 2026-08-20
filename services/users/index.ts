import BaseAPI from '@/config/baseApi'

import { User } from './type'

export type { User }

class UserApi extends BaseAPI {
  async updateProfile(profileData: Record<string, unknown>): Promise<any> {
    const response = await this.patch<{ data: any }>('/me', profileData, { isUseAuth: true })

    return response.data
  }

  async updateAvatar(avatarData: FormData): Promise<any> {
    const response = await this.patch<{ data: any }>('/me', avatarData, {
      isUseAuth: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async getProfile(): Promise<any> {
    const response = await this.get<{ data: any }>('/me', { isUseAuth: true })

    return response.data
  }

  async updateFcmToken(fcmToken: string): Promise<any> {
    const response = await this.patch<{ data: any }>('/me', { fcmToken }, { isUseAuth: true })

    return response.data
  }

  async getUsers(params?: { page?: number; limit?: number }): Promise<{ data: User[]; meta?: any }> {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    const response = await this.get<{ data: User[]; meta?: any }>(query.toString() ? `?${query.toString()}` : '', { isUseAuth: true })

    return response
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`, { isUseAuth: true })
  }

  async updateUser(id: string, payload: Partial<User>): Promise<User> {
    const response = await this.patch<{ data: User }>(`/${id}`, payload, { isUseAuth: true })

    return response.data
  }
}

const UserService = new UserApi('users')

export default UserService
