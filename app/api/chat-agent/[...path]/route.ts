import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = ['https://giatuisieusach.vercel.app', 'http://localhost:3000', 'http://localhost:3001'] as const
const MAX_BODY_BYTES = 1024 * 1024 // 1MB
const ALLOWED_PATHS = ['chat', 'completions']

// 🚀 THÊM MỚI: Xử lý CORS Preflight (Trình duyệt luôn gửi OPTIONS trước khi gửi POST)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (origin && ALLOWED_ORIGINS.includes(origin as any)) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  return new Response(null, { status: 403 })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const origin = request.headers.get('origin')

  if (!origin || !ALLOWED_ORIGINS.includes(origin as any)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { path } = await params

  if (!Array.isArray(path) || path.length < 2 || path[0] !== ALLOWED_PATHS[0] || path[1] !== ALLOWED_PATHS[1]) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 🚀 TỐI ƯU RAM CẤP ĐỘ 1: Chặn payload lớn NGAY TỪ HEADER (Tốn 0 RAM)
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)

  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  // Lúc này mới đọc body. Vì đã check Content-Length, ta chắc chắn nó < 1MB.
  const arrayBuffer = await request.arrayBuffer()

  const apiUrl = process.env.AGENT_API_URL || 'https://api.tokenrouter.com/v1'
  const apiKey = process.env.AGENT_API_KEY
  const target = `${apiUrl}/${path.join('/')}`

  try {
    // 🚀 TỐI ƯU RAM CẤP ĐỘ 2: Dùng Native Fetch (Bỏ @whatwg-node/fetch)
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: arrayBuffer,
    })

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': origin, // Bắt buộc phải có để Browser không chặn kết quả
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Proxy Stream Error:', err)

    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 })
  }
}
