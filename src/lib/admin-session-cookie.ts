/**
 * The admin session cookie, described once.
 *
 * Four places write it (password sign-in, passkey sign-in, first-run setup and
 * sign-out) and each used to repeat the attributes by hand. Keeping them here
 * means the remembered/short distinction and the security flags are defined in
 * one testable place.
 */
export const ADMIN_SESSION_COOKIE_NAME = 'admin_session'

export interface AdminSessionCookie {
  name: string
  value: string
  httpOnly: true
  sameSite: 'lax'
  secure: boolean
  path: '/'
  maxAge?: number
}

/**
 * @param maxAgeSeconds how long the cookie survives; omitting it makes a
 * browser-session cookie (gone when the browser closes). `0` deletes it.
 */
export function adminSessionCookie(
  value: string,
  options: { maxAgeSeconds?: number; secure?: boolean } = {},
): AdminSessionCookie {
  const { maxAgeSeconds, secure = false } = options
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    ...(maxAgeSeconds === undefined ? {} : { maxAge: maxAgeSeconds }),
  }
}
