import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase-middleware'

// Routes yang tidak butuh login
const PUBLIC_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  const response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createMiddlewareClient(request, response)

  // Refresh session jika expired (penting agar cookie diperbarui)
  const { data: { session } } = await supabase.auth.getSession()

  // Belum login → redirect ke /login
  if (!session && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Sudah login → jangan bisa akses /login atau /register lagi
  if (session && isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - File statis (svg, png, jpg, dll)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
