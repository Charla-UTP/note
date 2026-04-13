import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/sign-in', '/sign-up']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('insforge_access_token')?.value
  const refreshToken = request.cookies.get('insforge_refresh_token')?.value

  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p))
  const hasSession = !!accessToken || !!refreshToken

  // If user is on a public path and has a session, redirect to home
  if (isPublicPath && hasSession) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is on a protected path and has no session, redirect to sign-in
  if (!isPublicPath && !hasSession) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
