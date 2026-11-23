import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import type { AuthenticatorTransport, RegistrationResponseJSON } from '@simplewebauthn/server'
import { hasOwnerAccess } from '@/lib/admin-auth'
import { recordAdminEvent, describeCaller } from '@/lib/admin-audit'
import {
  getChallengeSecret,
  isSameOrigin,
  listAdminPasskeys,
  relyingPartyFor,
  saveAdminPasskey,
} from '@/lib/admin-passkey'
import {
  clearedPasskeyChallengeCookie,
  passkeyChallengeCookie,
  readPasskeyChallenge,
  safeDeviceLabel,
  signPasskeyChallenge,
} from '@/lib/passkey-core'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** How many passkeys one owner may enrol; beyond that, remove an old device. */
const MAX_PASSKEYS = 8

/**
 * Adding a passkey. Two steps, as WebAuthn requires: the server mints a
 * challenge, the device signs it with the private key it just created, and the
 * signature is verified here before anything is stored.
 *
 * Both steps need an owner session — a passkey is a way *in*, so enrolling one
 * is strictly a signed-in action.
 */
export async function POST(request: NextRequest) {
  if (!(await hasOwnerAccess())) {
    return NextResponse.json({ error: 'Sign in to add a passkey.' }, { status: 401 })
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request refused.' }, { status: 403 })
  }

  const relyingParty = relyingPartyFor(request)
  const secret = await getChallengeSecret()
  if (!relyingParty || !secret) {
    return NextResponse.json(
      { error: 'Passkeys are not configured for this deployment yet.' },
      { status: 503 },
    )
  }

  let body: { step?: string; response?: RegistrationResponseJSON; label?: string } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const existing = await listAdminPasskeys()

  if (body.step === 'options') {
    if (existing.length >= MAX_PASSKEYS) {
      return NextResponse.json(
        { error: `You already have ${MAX_PASSKEYS} passkeys. Remove one before adding another.` },
        { status: 409 },
      )
    }

    const options = await generateRegistrationOptions({
      rpName: relyingParty.rpName,
      rpID: relyingParty.rpID,
      userID: Buffer.from('admin-ashok-rimal'),
      userName: process.env.ADMIN_EMAIL || 'owner',
      userDisplayName: 'Ashok Rimal',
      attestationType: 'none',
      excludeCredentials: existing.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports as AuthenticatorTransport[],
      })),
      authenticatorSelection: {
        // `required` is what makes this a biometric/PIN check rather than a
        // tap: the authenticator must verify the person holding the device.
        userVerification: 'required',
        residentKey: 'preferred',
      },
    })

    const response = NextResponse.json(options)
    response.cookies.set(
      passkeyChallengeCookie(
        signPasskeyChallenge({
          challenge: options.challenge,
          purpose: 'register',
          secret,
        }),
      ),
    )
    return response
  }

  if (body.step === 'verify') {
    const expectedChallenge = readPasskeyChallenge({
      token: request.cookies.get('admin_passkey_challenge')?.value,
      purpose: 'register',
      secret,
    })

    const response = NextResponse.json({ error: 'That passkey took too long to set up.' }, { status: 400 })
    response.cookies.set(clearedPasskeyChallengeCookie())

    if (!expectedChallenge || !body.response) return response

    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: body.response,
        expectedChallenge,
        expectedOrigin: relyingParty.origin,
        expectedRPID: relyingParty.rpID,
        requireUserVerification: true,
      })
    } catch (error) {
      console.warn('[passkey] Registration could not be verified:', (error as Error).message)
      return NextResponse.json({ error: 'That passkey could not be verified.' }, { status: 400 })
    }

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'That passkey could not be verified.' }, { status: 400 })
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo
    const saved = await saveAdminPasskey({
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: credential.transports ?? [],
      label: safeDeviceLabel(body.label),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    })

    if (!saved) {
      return NextResponse.json(
        { error: 'That passkey could not be stored. Try again.' },
        { status: 503 },
      )
    }

    await recordAdminEvent({
      action: 'passkey-added',
      detail: `${safeDeviceLabel(body.label)} (${credentialDeviceType})`,
      caller: describeCaller(request.headers),
    })

    const success = NextResponse.json({ success: true })
    success.cookies.set(clearedPasskeyChallengeCookie())
    return success
  }

  return NextResponse.json({ error: 'Unknown step.' }, { status: 400 })
}
