import { NextResponse, type NextRequest } from 'next/server'

const CMS_HOST = 'cms.ashokrimal.com.np'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]
  if (host === CMS_HOST && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
