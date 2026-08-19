import { COOKIES_KEY } from '@/constants/cookies'
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

// Read the `exp` (seconds) claim from a JWT without verifying the signature.
// The access token cookie is httpOnly, so we cannot rely on its max-age to know if it expired.
const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = token.split('.')[1]

    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized))

    return typeof decoded.exp === 'number' ? decoded.exp : null
  } catch {
    return null
  }
}

class BaseAPI {
  private baseUrl: string = process.env.NEXT_PUBLIC_API_APP || 'http://localhost:3000'
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  private async saveTokens(tokens: TokenResponse): Promise<void> {
    await setCookie(COOKIES_KEY.accessToken, tokens.accessToken, tokens.accessTokenExpiresIn)
    await setCookie(COOKIES_KEY.refreshToken, tokens.refreshToken, tokens.refreshTokenExpiresIn)
  }

  private async clearTokens(): Promise<void> {
    await removeCookie(COOKIES_KEY.accessToken)
    await removeCookie(COOKIES_KEY.refreshToken)
  }

  async getAuthToken(): Promise<string | null> {
    const accessToken = await getCookie(COOKIES_KEY.accessToken)

    // The access token exists and is still valid (refresh slightly before it expires)
    if (accessToken) {
      const expiry = getTokenExpiry(accessToken)
      const isExpired = expiry !== null && expiry * 1000 <= Date.now() + 5000

      if (!isExpired) {
        return accessToken
      }
    }

    const refreshToken = await getCookie(COOKIES_KEY.refreshToken)

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
      // The proactive refresh in getAuthToken may have missed an already-expired token
      // (e.g. clock drift or concurrent requests). Fall back to a refresh + retry once.
      const refreshToken = await getCookie(COOKIES_KEY.refreshToken)

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

  // Public by default, pass isUseAuth to send the bearer token
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
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

  async patch<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      isUseAuth: options?.isUseAuth ?? true,
      method: 'PATCH',
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
