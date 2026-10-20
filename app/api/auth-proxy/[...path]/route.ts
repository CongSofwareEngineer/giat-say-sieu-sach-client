import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { COOKIES_KEY } from '@/constants/cookies'
import { getTokenExpiry } from '@/config/baseApi'

export const runtime = 'nodejs'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_APP || 'https://server-giat-say-sieu-sach-nestjs.onrender.com'

async function proxy(request: NextRequest, method: string, params: Promise<{ path: string[] }>) {
  const { path } = await params
  const targetUrl = `${BACKEND_URL}/${path.join('/')}${request.nextUrl.search}`

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const body = ['GET', 'HEAD'].includes(method) ? undefined : await request.text()

  let response = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: 'manual',
  })

  if (response.status === 401 && accessToken && refreshToken) {
    const refreshResponse = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshToken}` },
    })

    // The backend returns `{ data: { accessToken } }`; the refresh token is not rotated
    const newAccessToken: string | undefined = refreshResponse.ok ? (await refreshResponse.json())?.data?.accessToken : undefined

    if (newAccessToken) {
      const expiry = getTokenExpiry(newAccessToken)

      cookieStore.set(COOKIES_KEY.accessToken, newAccessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/',
        ...(expiry ? { maxAge: Math.max(expiry - Math.floor(Date.now() / 1000), 0) } : {}),
      })

      response = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newAccessToken}`,
        },
        body,
        redirect: 'manual',
      })
    } else {
      cookieStore.delete('accessToken')
      cookieStore.delete('refreshToken')
    }
  }

  return response
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const response = await proxy(request, 'GET', params)

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const response = await proxy(request, 'POST', params)

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const response = await proxy(request, 'PUT', params)

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const response = await proxy(request, 'PATCH', params)

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const response = await proxy(request, 'DELETE', params)

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}
