import { NextRequest, NextResponse } from 'next/server'
import { ALLOWED_ORIGINS, LOCATION_API } from '@/constants/app'

const getOrigin = (url: string | null): string | null => {
  if (!url) return null

  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

// Only same-origin browser requests from our domains (same-origin GET sends no Origin header, so check Referer too)
const isAllowedRequest = (request: NextRequest): boolean => {
  if (request.headers.get('sec-fetch-site') !== 'same-origin') return false

  const origin = getOrigin(request.headers.get('origin')) ?? getOrigin(request.headers.get('referer'))

  return !!origin && ALLOWED_ORIGINS.includes(origin)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!isAllowedRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { path } = await params
  const subPath = Array.isArray(path) ? path.join('/') : ''

  if (!LOCATION_API.pathRegex.test(subPath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    // Server data cache: upstream is hit at most once per path per cacheSeconds, however many clients call us
    const response = await fetch(`${LOCATION_API.upstream}/${subPath}`, {
      next: { revalidate: LOCATION_API.cacheSeconds },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
    }

    const data = await response.json()

    // `private` keeps CDN from serving cached copies to callers that skipped the origin check
    return NextResponse.json(data, {
      headers: { 'Cache-Control': `private, max-age=${LOCATION_API.cacheSeconds}` },
    })
  } catch {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
  }
}
