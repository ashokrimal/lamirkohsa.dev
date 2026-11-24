import { NextRequest, NextResponse } from 'next/server'
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type { AuthenticationResponseJSON, AuthenticatorTransport } from '@simplewebauthn/server'
import {
  ADMIN_REMEMBERED_SESSION_MAX_AGE,
  createAdminSessionToken,
  isAdminAuthConfigured,
} from '@/lib/admin-auth'
import { describeCaller, recordAdminEvent } from '@/lib/admin-audit'
import { adminSessionCookie } from '@/lib/admin-session-cookie'
import {
  findAdminPasskey,
  getChallengeSecret,
  isSameOrigin,
  listAdminPasskeys,
  relyingPartyFor,
  touchAdminPasskey,
} from '@/lib/admin-passkey'
import {
  clearedPasskeyChallengeCookie,
  passkeyChallengeCookie,
  readPasskeyChallenge,
  signPasskeyChallenge,
} from '@/lib/passkey-core'
import { createSlidingWindowLimiter } from '@/lib/rate-limit'
import { consumeDurableLimit } from '@/lib/rate-limit-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WINDOW_MS = 10 * 60 * 1000
const ATTEMPTS_PER_WINDOW = 10
const limiter = createSlidingWindowLimiter({ limit: ATTEMPTS_PER_WINDOW, windowMs: WINDOW_MS })

function callerKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}

/**
 * Signing in with a passkey: the fingerprint/face check happens on the device,
 * this route only verifies the resulting assertion. A passkey replaces the
 * password *and* the authenticator code for this one flow, because the
 * authenticator already proved the person with user verification.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthConfigured())) {
    return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 })
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request refused.' }, { status: 403 })
  }

  const identifier = callerKey(request)
  const memory = limiter.check(identifier)
  if (!memory.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(memory.retryAfterSeconds) } },
    )
  }
  const durable = await consumeDurableLimit({
    scope: 'admin-passkey',
    identifier,
    limit: ATTEMPTS_PER_WINDOW,
    windowMs: WINDOW_MS,
  })
  if (!durable.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(durable.retryAfterSeconds) } },
    )
  }

  const relyingParty = relyingPartyFor(request)
  const secret = await getChallengeSecret()
  if (!relyingParty || !secret) {
    return NextResponse.json({ error: 'Passkeys are not available here.' }, { status: 503 })
  }

  let body: { step?: string; response?: AuthenticationResponseJSON } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (body.step === 'options') {
    const passkeys = await listAdminPasskeys()
    if (!passkeys.length) {
      return NextResponse.json(
        { error: 'No passkey is set up for the studio yet. Sign in with your password, then add one under Security.' },
        { status: 404 },
      )
    }

    const options = await generateAuthenticationOptions({
      rpID: relyingParty.rpID,
      allowCredentials: passkeys.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports as AuthenticatorTransport[],
      })),
      userVerification: 'required',
    })

    const response = NextResponse.json(options)
    response.cookies.set(
      passkeyChallengeCookie(
        signPasskeyChallenge({ challenge: options.challenge, purpose: 'login', secret }),
      ),
    )
    return response
  }

  if (body.step === 'verify') {
    const expectedChallenge = readPasskeyChallenge({
      token: request.cookies.get('admin_passkey_challenge')?.value,
      purpose: 'login',
      secret,
    })

    const rejected = NextResponse.json(
      { error: 'That passkey could not be verified. Try again or use your password.' },
      { status: 401 },
    )
    rejected.cookies.set(clearedPasskeyChallengeCookie())

    if (!expectedChallenge || !body.response?.id) return rejected

    const passkey = await findAdminPasskey(body.response.id)
    if (!passkey) {
      await recordAdminEvent({
        action: 'sign-in-failed',
        detail: 'unknown passkey',
        caller: describeCaller(request.headers),
      })
      return rejected
    }

    let verification
    try {
      verification = await verifyAuthenticationResponse({
        response: body.response,
        expectedChallenge,
        expectedOrigin: relyingParty.origin,
        expectedRPID: relyingParty.rpID,
        credential: {
          id: passkey.credentialId,
          publicKey: Buffer.from(passkey.publicKey, 'base64url'),
          counter: passkey.counter,
          transports: passkey.transports as AuthenticatorTransport[],
        },
        requireUserVerification: true,
      })
    } catch (error) {
      console.warn('[passkey] Assertion could not be verified:', (error as Error).message)
      return rejected
    }

    if (!verification.verified) {
      await recordAdminEvent({
        action: 'sign-in-failed',
        detail: 'passkey assertion rejected',
        caller: describeCaller(request.headers),
      })
      return rejected
    }

    await touchAdminPasskey(passkey.credentialId, verification.authenticationInfo.newCounter)

    // A passkey is already bound to this device, so the session it starts is a
    // remembered one.
    const token = await createAdminSessionToken(Date.now(), ADMIN_REMEMBERED_SESSION_MAX_AGE)
    if (!token) {
      return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(
      adminSessionCookie(token, {
        maxAgeSeconds: ADMIN_REMEMBERED_SESSION_MAX_AGE,
        secure: process.env.NODE_ENV === 'production',
      }),
    )
    response.cookies.set(clearedPasskeyChallengeCookie())

    await recordAdminEvent({
      action: 'passkey-sign-in',
      detail: `${passkey.label} (${verification.authenticationInfo.credentialDeviceType})`,
      caller: describeCaller(request.headers),
    })
    return response
  }

  return NextResponse.json({ error: 'Unknown step.' }, { status: 400 })
}
