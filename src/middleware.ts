import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleApiError } from './lib/error-handler';

export async function middleware(request: NextRequest) {
  // Canonical lowercase path for the GitHub archive. Redirect sources are
  // matched case-insensitively, so this lives here rather than in next.config.
  if (request.nextUrl.pathname === '/about/GitHub') {
    const url = request.nextUrl.clone()
    url.pathname = '/about/github'
    return NextResponse.redirect(url, 308)
  }

  // The studio is owner-only. Page components validate the signed cookie; this
  // early check turns "not signed in" into a real HTTP redirect instead of a
  // streamed client redirect, and keeps signed-out visitors off the page shell.
  const { pathname } = request.nextUrl
  const hasAdminCookie = Boolean(request.cookies.get('admin_session')?.value)
  const hasBetterAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes('better-auth.session_token'))

  // Do not bounce /admin/sign-in back to /admin based on cookie presence alone.
  // A stale or invalid admin cookie would otherwise alternate between the page
  // guard and this redirect forever. The sign-in page validates the real session
  // server-side and redirects only when it is still valid.

  if (pathname.startsWith('/admin') && pathname !== '/admin/sign-in' && pathname !== '/admin/sign-out') {
    if (!hasAdminCookie && !hasBetterAuthCookie) {
      const url = request.nextUrl.clone()
      const returnTo = `${pathname}${request.nextUrl.search}`
      url.pathname = '/admin/sign-in'
      url.search = ''
      url.searchParams.set('returnTo', returnTo)
      return NextResponse.redirect(url, 307)
    }
  }

  try {
    return NextResponse.next();
  } catch (error) {
    const appError = handleApiError(error);
    return new NextResponse(
      JSON.stringify({
        message: appError.message,
        status: appError.statusCode || 500,
      }),
      {
        status: appError.statusCode || 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export const config = {
  matcher: ['/api/:path*', '/about/:path*', '/admin/:path*'],
};
