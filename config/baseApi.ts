import { COOKIES_KEY } from '@/constants/cookies'
import { getCookie, setCookie } from '@/utils/cookie'
import { toast } from '@/utils/toast'
import { user as userStore } from '@/zustand/user'
import { language as languageStore } from '@/zustand/language'

// POST /auth/refresh response: only a new access token (the refresh token is not rotated)
interface RefreshResponse {
  data?: {
    accessToken?: string
    accessExpire?: string
  }
}

interface RequestOptions extends RequestInit {
  isUseAuth?: boolean
}

// API error that keeps the HTTP status so callers can tell 404 from other failures
export class HttpError extends Error {
  status: number

  constructor(status: number) {
    super(`HTTP error! status: ${status}`)
    this.status = status
  }
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

// Status codes returned when the server rejects the refresh token
const REFRESH_REJECTED_STATUS = [401, 403]

// Log the user out in the client and tell them to login again.
// Never removes the token cookies; only resets the user state.
const handleSessionExpired = () => {
  if (typeof window === 'undefined') return

  const { isLogin, logout } = userStore.getState()

  // Avoid duplicated toasts when several requests fail at the same time
  if (!isLogin) return

  logout()
  toast({
    type: 'warning',
    message: languageStore.getState().language.messages.auth.sessionExpired,
  })
}

// Read the `exp` (seconds) claim from a JWT without verifying the signature.
// The access token cookie is httpOnly, so we cannot rely on its max-age to know if it expired.
export const getTokenExpiry = (token: string): number | null => {
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

  // Only the access token cookie is replaced; the refresh token cookie keeps its value and lifetime.
  // Not remembered (client) -> session cookie, otherwise it lives until the JWT `exp`.
  private async saveAccessToken(accessToken: string): Promise<void> {
    const isRemembered = typeof window === 'undefined' || userStore.getState().isRemembered
    const expiry = getTokenExpiry(accessToken)
    const maxAge = isRemembered && expiry ? Math.max(expiry - Math.floor(Date.now() / 1000), 0) : undefined

    await setCookie(COOKIES_KEY.accessToken, accessToken, maxAge || undefined)
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

    return this.renewAccessToken()
  }

  // Use the refresh token to get a new access token. Tokens are never removed here.
  private async renewAccessToken(): Promise<string | null> {
    const refreshToken = await getCookie(COOKIES_KEY.refreshToken)

    if (!refreshToken) {
      handleSessionExpired()

      return null
    }

    try {
      const newAccessToken = await this.refreshAccessToken(refreshToken)

      if (newAccessToken) {
        await this.saveAccessToken(newAccessToken)

        return newAccessToken
      }
    } catch (error) {
      // Only a rejected refresh token means the login expired; network errors are ignored
      if (error instanceof HttpError && REFRESH_REJECTED_STATUS.includes(error.status)) {
        handleSessionExpired()
      }
    }

    return null
  }

  private async refreshAccessToken(refreshToken: string): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
      return refreshPromise
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

  private async executeRefresh(refreshToken: string): Promise<string | null> {
    const url = `${this.baseUrl}/auth/refresh`

    // The server reads the refresh token from the Authorization header, not the body
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    if (!response.ok) {
      throw new HttpError(response.status)
    }

    // The backend wraps the payload in `data`
    const result: RefreshResponse = await response.json()

    return result.data?.accessToken || null
  }

  async request<T>(url: string, options?: RequestOptions): Promise<T> {
    let urlFinal = `${this.baseUrl}/${this.endpoint}${url}`

    urlFinal = urlFinal.replace(/([^:]\/)\/+/g, '$1')

    // Let the browser set the multipart boundary for FormData bodies
    const isFormData = options?.body instanceof FormData
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

    if (response.status === 401 && options?.isUseAuth) {
      // The proactive refresh in getAuthToken may have missed an already-expired token
      // (e.g. clock drift or concurrent requests). Fall back to a refresh + retry once.
      const newAccessToken = await this.renewAccessToken()

      if (newAccessToken) {
        headers['Authorization'] = `Bearer ${newAccessToken}`

        response = await fetch(urlFinal, {
          ...options,
          headers,
        })
      }
    }

    if (!response.ok) {
      throw new HttpError(response.status)
    }

    return response.json() as Promise<T>
  }

  // Pass isUseAuth to send the bearer token
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T>(url: string, body: any, options: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      isUseAuth: true,
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...((options?.headers as Record<string, string>) || {}),
      },
      body: JSON.stringify(body),
    })
  }

  // Send a multipart/form-data body (e.g. file uploads) without JSON encoding
  async postFormData<T>(url: string, body: FormData, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      isUseAuth: true,
      ...options,
      method: 'POST',
      body,
    })
  }

  async put<T>(url: string, body: any, options: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      isUseAuth: true,
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...((options?.headers as Record<string, string>) || {}),
      },
      body: JSON.stringify(body),
    })
  }

  async patch<T>(url: string, body: any, options: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      isUseAuth: true,
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...((options?.headers as Record<string, string>) || {}),
      },
      body: JSON.stringify(body),
    })
  }

  async delete<T>(url: string, options: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      isUseAuth: true,
      ...options,
      method: 'DELETE',
    })
  }
}

export default BaseAPI
