import { NextRequest, NextResponse } from 'next/server'
import { fetch } from '@whatwg-node/fetch'

const ALLOWED_ORIGINS = ['https://giatuisieusach.vercel.app', 'http://localhost:3000', 'http://localhost:3001'] as const

const MAX_BODY_BYTES = 1024 * 1024 // 1MB
const ALLOWED_PATHS = ['chat', 'completions']

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const origin = request.headers.get('origin')

  if (!origin || !ALLOWED_ORIGINS.includes(origin as any)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { path } = await params

  if (!Array.isArray(path) || path.length < 2 || path[0] !== ALLOWED_PATHS[0] || path[1] !== ALLOWED_PATHS[1]) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Kiểm tra kích thước Body (An toàn, tránh tràn RAM trên Render)
  // Đọc dưới dạng ArrayBuffer để kiểm tra byte length chính xác và hiệu quả
  const arrayBuffer = await request.arrayBuffer()

  if (arrayBuffer.byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  const apiUrl = process.env.AGENT_API_URL || 'https://api.tokenrouter.com/v1'
  const apiKey = process.env.AGENT_API_KEY
  const target = `${apiUrl}/${path.join('/')}`

  try {
    // 4. Gọi API đích
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: arrayBuffer, // Truyền trực tiếp ArrayBuffer, @whatwg-node/fetch xử lý tốt
    })

    // 5. Trả về Response dưới dạng Stream (Next.js App Router tự động handle Web Stream)
    // Không cần pipeline, không cần chuyển đổi stream phức tạp như Pages Router
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        // Các header quan trọng để chống buffering trên proxy (Render/Vercel)
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
