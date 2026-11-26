import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleApiError } from './lib/error-handler';
import { bumpSlugRedirectHit, resolveRenamedPath } from './lib/slug-history';
import { publishedPaths, STATIC_PATHS } from './lib/public-paths';

/** A renamed record's URL: `/blogs/<slug>` or `/projects/<slug>`. */
const RENAMED_PAGE_PATH = /^\/(blogs|projects)\/[^/]+$/;

/** A path that a CMS record, rather than a route file, has to serve. */
const RECORD_PAGE_PATH = /^(?:\/(?:blogs|projects)\/[^/]+|\/[^/]+)$/;

export async function proxy(request: NextRequest) {
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
    // A renamed record keeps its old URL working. This has to happen before the
    // route renders: the root loading boundary streams a 200 immediately, which
    // downgrades a redirect thrown in the page to a meta refresh.
    if (RENAMED_PAGE_PATH.test(pathname)) {
      const renamed = await resolveRenamedPath(pathname);
      if (renamed) {
        await bumpSlugRedirectHit(pathname);
        return NextResponse.redirect(new URL(renamed, request.url), 308);
      }
    }

    // An unknown path is answered here, not in the page: a dynamic page has
    // already committed a 200 by the time it learns the record is missing, so
    // its notFound() could only swap the body. Rewriting keeps the address and
    // sends a real 404.
    // A dotted last segment is a file (`/og.png`, `/sw.js`), never a record.
    if (
      RECORD_PAGE_PATH.test(pathname) &&
      !pathname.split('/').pop()?.includes('.') &&
      !STATIC_PATHS.has(pathname)
    ) {
      const published = await publishedPaths();
      if (published && !published.has(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = '/not-found-view';
        url.search = '';
        return NextResponse.rewrite(url, { status: 404 });
      }
    }

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
  matcher: [
    '/api/:path*',
    '/about/:path*',
    '/admin/:path*',
    '/blogs/:path*',
    '/projects/:path*',
    // One-segment paths are where the `[slug]` page lives, so the proxy has to
    // see them to answer an unknown one with a real 404.
    '/:slug',
  ],
};
