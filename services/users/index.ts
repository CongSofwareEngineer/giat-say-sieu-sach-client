import BaseAPI from '@/config/baseApi'

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
}

const UserService = new UserApi('users')

export default UserService
