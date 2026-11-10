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
  matcher: ['/api/:path*', '/about/:path*'],
};
