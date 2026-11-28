import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleApiError } from './lib/error-handler';

/**
 * The request boundary in front of the public site.
 *
 * The admin studio is a separate deployment (`lamirkohsa.cms`) and is never
 * served from this origin, so nothing here guards `/admin`.
 *
 * It stays free of the database and of app libraries on purpose: on Cloudflare
 * this file is bundled into its own worker, where a bundled `pg` fails with a
 * cross-realm promise error. Record lookups (a renamed slug, an unknown path)
 * therefore live in the routes themselves, which run inside the app server.
 */
export async function proxy(request: NextRequest) {
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
