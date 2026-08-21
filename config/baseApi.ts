interface RequestOptions extends RequestInit {
  isUseAuth?: boolean
}

class BaseAPI {
  private baseUrl: string = '/api/auth-proxy'
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async request<T>(url: string, options?: RequestOptions): Promise<T> {
    let urlFinal = `${this.baseUrl}/${this.endpoint}${url}`

    urlFinal = urlFinal.replace(/([^:]\/)\/+/g, '$1')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    }

    const response = await fetch(urlFinal, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'HTTP error!' }))

      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json() as Promise<T>
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T>(url: string, body: any, options: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(url: string, body: any, options: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async patch<T>(url: string, body: any, options: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}

export default BaseAPI
