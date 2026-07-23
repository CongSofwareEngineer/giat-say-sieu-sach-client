import { COOKIES } from '@/constants/app'
import { getCookie, setCookie, removeCookie } from '@/utils/cookie'

interface TokenResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresIn: number
}

interface RequestOptions extends RequestInit {
  isUseAuth?: boolean
}

let isRefreshing = false
let refreshPromise: Promise<TokenResponse | null> | null = null

class BaseAPI {
  private baseUrl: string = process.env.NEXT_PUBLIC_API_APP || 'http://localhost:3000'
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  private async saveTokens(tokens: TokenResponse): Promise<void> {
    await setCookie(COOKIES.ACCESS_TOKEN_KEY, tokens.accessToken, tokens.accessTokenExpiresIn)
    await setCookie(COOKIES.REFRESH_TOKEN_KEY, tokens.refreshToken, tokens.refreshTokenExpiresIn)
  }

  private async clearTokens(): Promise<void> {
    await removeCookie(COOKIES.ACCESS_TOKEN_KEY)
    await removeCookie(COOKIES.REFRESH_TOKEN_KEY)
  }

  async getAuthToken(): Promise<string | null> {
    const accessToken = await getCookie(COOKIES.ACCESS_TOKEN_KEY)

    if (accessToken) {
      return accessToken
    }

    const refreshToken = await getCookie(COOKIES.REFRESH_TOKEN_KEY)

    if (!refreshToken) {
      return null
    }

    try {
      const newTokens = await this.refreshAccessToken(refreshToken)

      if (newTokens) {
        await this.saveTokens(newTokens)

        return newTokens.accessToken
      }
    } catch {
      await this.clearTokens()
    }

    return null
  }

  private async refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
    if (isRefreshing && refreshPromise) {
      return refreshPromise as Promise<TokenResponse | null>
    }

    isRefreshing = true
    refreshPromise = this.executeRefresh(refreshToken)

    try {
      const result = await refreshPromise

      return result
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  }

  private async executeRefresh(refreshToken: string): Promise<TokenResponse | null> {
    const url = `${this.baseUrl}/auth/refresh`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Refresh token failed')
    }

    return response.json()
  }

  async request<T>(url: string, options?: RequestOptions): Promise<T> {
    let urlFinal = `${this.baseUrl}/${this.endpoint}${url}`

    urlFinal = urlFinal.replace(/([^:]\/)\/+/g, '$1')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    }

    if (options?.isUseAuth) {
      const token = await this.getAuthToken()

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    let response = await fetch(urlFinal, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      const refreshToken = await getCookie(COOKIES.REFRESH_TOKEN_KEY)

      if (refreshToken) {
        try {
          const newTokens = await this.refreshAccessToken(refreshToken)

          if (newTokens) {
            await this.saveTokens(newTokens)

            headers['Authorization'] = `Bearer ${newTokens.accessToken}`

            response = await fetch(urlFinal, {
              ...options,
              headers,
            })
          }
        } catch {
          await this.clearTokens()
        }
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json() as Promise<T>
  }

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      isUseAuth: options?.isUseAuth ?? true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...((options?.headers as Record<string, string>) || {}),
      },
      body: JSON.stringify(body),
    })
  }

  async put<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      isUseAuth: options?.isUseAuth ?? true,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...((options?.headers as Record<string, string>) || {}),
      },
      body: JSON.stringify(body),
    })
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, isUseAuth: options?.isUseAuth ?? true, method: 'DELETE' })
  }
}

export default BaseAPI
