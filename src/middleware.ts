import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleApiError } from './lib/error-handler';

export async function middleware(request: NextRequest) {
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
  matcher: '/api/:path*',
};
