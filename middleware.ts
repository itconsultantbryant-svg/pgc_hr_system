import { NextRequest, NextResponse } from 'next/server'

const getBackendBaseUrl = () => {
  const raw = process.env.BACKEND_URL?.trim()
  if (!raw) return null
  if (raw.includes('postgres://') || raw.includes('postgresql://')) return null

  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return raw.replace(/\/$/, '')
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const backendBase = getBackendBaseUrl()
  if (!backendBase) return NextResponse.next()

  const { pathname, search } = request.nextUrl
  const shouldProxyApi = pathname.startsWith('/api/')
  const shouldProxyUploads = pathname.startsWith('/uploads/')

  if (!shouldProxyApi && !shouldProxyUploads) {
    return NextResponse.next()
  }

  const destination = `${backendBase}${pathname}${search || ''}`
  return NextResponse.rewrite(destination)
}

export const config = {
  matcher: ['/api/:path*', '/uploads/:path*'],
}
