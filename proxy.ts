import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Schützt alle Admin-Seiten. Die Server-Actions prüfen die Sitzung zusätzlich selbst.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()
  const token = request.cookies.get('ava_admin')?.value
  const secret = process.env.AUTH_SECRET
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret))
      return NextResponse.next()
    } catch {}
  }
  const url = request.nextUrl.clone()
  url.pathname = '/admin/login'
  url.search = pathname !== '/admin' ? `?next=${encodeURIComponent(pathname)}` : ''
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/admin', '/admin/:path*'] }
