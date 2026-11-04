import { NextResponse, type NextRequest } from 'next/server'

const CMS_HOST = 'cms.ashokrimal.com.np'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]
  const isPreviewHost = !host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app') || host.endsWith('.v0.app')
  if (!isPreviewHost && host !== CMS_HOST && request.nextUrl.pathname === '/admin') {
    return NextResponse.redirect(new URL(`https://${CMS_HOST}`, request.url))
  }
  if (host === CMS_HOST && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin'],
}
