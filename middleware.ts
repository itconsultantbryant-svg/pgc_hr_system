import { NextRequest, NextResponse } from 'next/server'
import { getBackendProxyBaseUrl, shouldProxyApiRequests } from '@/lib/backendProxyBaseUrl'

export function middleware(request: NextRequest) {
  if (!shouldProxyApiRequests()) {
    return NextResponse.next()
  }

  const backendBase = getBackendProxyBaseUrl()
  if (!backendBase) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/uploads/')) {
    return NextResponse.next()
  }

  const target = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    `${backendBase}/`
  )

  return NextResponse.rewrite(target)
}

export const config = {
  matcher: ['/api/:path*', '/uploads/:path*'],
}
