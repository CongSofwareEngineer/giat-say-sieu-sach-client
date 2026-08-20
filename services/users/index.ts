import BaseAPI from '@/config/baseApi'

class UserApi extends BaseAPI {
  async login(sdt: string, password: string): Promise<any> {
    const response = await this.post<{ data: any }>('/login', { sdt, password }, { isUseAuth: false })

    return response.data
  }

  async register(sdt: string, password: string): Promise<any> {
    const response = await this.post<{ data: any }>('/register', { sdt, password }, { isUseAuth: false })

    return response.data
  }

  async updateProfile(profileData: Record<string, unknown>): Promise<any> {
    const response = await this.put<{ data: any }>('/profile', profileData, { isUseAuth: true })

    return response.data
  }

  async updateAvatar(avatarData: FormData): Promise<any> {
    const response = await this.put<{ data: any }>('/profile/avatar', avatarData, {
      isUseAuth: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async getProfile(): Promise<any> {
    const response = await this.get<{ data: any }>('/profile', { isUseAuth: true })

    return response.data
  }
}

const UserService = new UserApi('users')

export default UserService
