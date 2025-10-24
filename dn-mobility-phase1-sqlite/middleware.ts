import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const adminPaths = ['/admin', '/admin-it']
  const dashboardPaths = ['/dashboard', '/mes-missions']
  const isAdminZone = adminPaths.some(p => pathname.startsWith(p))
  const isDashZone = dashboardPaths.some(p => pathname.startsWith(p))
  if (!isAdminZone && !isDashZone) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const url = new URL('/signin', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  const role = token.role as string | undefined
  if (isAdminZone && role !== 'ADMIN' && role !== 'ADMIN_IT') {
    return NextResponse.redirect(new URL('/signin', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin-it/:path*', '/dashboard/:path*', '/mes-missions/:path*'],
}
