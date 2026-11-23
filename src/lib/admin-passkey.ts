import { pool } from '@/lib/db'
import { getAdminIdentity } from '@/lib/admin-auth'
import { registrableRpId } from '@/lib/passkey-core'
import { SITE_URL } from '@/lib/seo'

/**
 * Stored passkeys for the studio owner.
 *
 * A passkey is a public key plus a credential id. The private key never leaves
 * the owner's device — the fingerprint or face scan happens on the phone or
 * laptop itself — so this table can be read back without exposing a secret. It
 * is deliberately separate from `adminCredential`: removing every passkey leaves
 * the password sign-in exactly as it was.
 *
 * The table is created on first use, like `adminCredential`, because the project
 * has no committed migration runner.
 */

export type AdminPasskey = {
  id: number
  credentialId: string
  publicKey: string
  counter: number
  transports: string[]
  label: string
  deviceType: string
  backedUp: boolean
  createdAt: string
  lastUsedAt: string | null
}

let tableReady = false

export async function ensureAdminPasskeyTable(): Promise<void> {
  if (tableReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "adminPasskey" (
      "id" serial PRIMARY KEY,
      "credentialId" text NOT NULL UNIQUE,
      "publicKey" text NOT NULL,
      "counter" bigint NOT NULL DEFAULT 0,
      "transports" text[] NOT NULL DEFAULT '{}',
      "label" text NOT NULL DEFAULT 'This device',
      "deviceType" text NOT NULL DEFAULT 'singleDevice',
      "backedUp" boolean NOT NULL DEFAULT false,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "lastUsedAt" timestamptz
    )
  `)
  tableReady = true
}

function toPasskey(row: Record<string, any>): AdminPasskey {
  return {
    id: Number(row.id),
    credentialId: String(row.credentialId),
    publicKey: String(row.publicKey),
    counter: Number(row.counter ?? 0),
    transports: Array.isArray(row.transports) ? row.transports.map(String) : [],
    label: String(row.label ?? 'This device'),
    deviceType: String(row.deviceType ?? 'singleDevice'),
    backedUp: row.backedUp === true,
    createdAt: new Date(row.createdAt).toISOString(),
    lastUsedAt: row.lastUsedAt ? new Date(row.lastUsedAt).toISOString() : null,
  }
}

/** Every passkey, public key included. Server-side only. */
export async function listAdminPasskeys(): Promise<AdminPasskey[]> {
  try {
    await ensureAdminPasskeyTable()
    const result = await pool.query(
      `SELECT "id","credentialId","publicKey","counter","transports","label","deviceType","backedUp","createdAt","lastUsedAt"
         FROM "adminPasskey"
        ORDER BY "createdAt" ASC`,
    )
    return result.rows.map(toPasskey)
  } catch (error) {
    console.warn('[passkey] Could not list passkeys:', (error as Error).message)
    return []
  }
}

/** What the studio may show: never the public key. */
export async function listAdminPasskeySummaries() {
  const passkeys = await listAdminPasskeys()
  return passkeys.map(({ publicKey: _publicKey, ...summary }) => summary)
}

export async function findAdminPasskey(credentialId: string): Promise<AdminPasskey | null> {
  if (!credentialId) return null
  try {
    await ensureAdminPasskeyTable()
    const result = await pool.query(
      `SELECT "id","credentialId","publicKey","counter","transports","label","deviceType","backedUp","createdAt","lastUsedAt"
         FROM "adminPasskey" WHERE "credentialId" = $1 LIMIT 1`,
      [credentialId],
    )
    return result.rows[0] ? toPasskey(result.rows[0]) : null
  } catch (error) {
    console.warn('[passkey] Could not read a passkey:', (error as Error).message)
    return null
  }
}

export async function saveAdminPasskey(input: {
  credentialId: string
  publicKey: string
  counter: number
  transports: string[]
  label: string
  deviceType: string
  backedUp: boolean
}): Promise<boolean> {
  try {
    await ensureAdminPasskeyTable()
    await pool.query(
      `INSERT INTO "adminPasskey"
         ("credentialId","publicKey","counter","transports","label","deviceType","backedUp")
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        input.credentialId,
        input.publicKey,
        input.counter,
        input.transports,
        input.label,
        input.deviceType,
        input.backedUp,
      ],
    )
    return true
  } catch (error) {
    console.warn('[passkey] Could not save the passkey:', (error as Error).message)
    return false
  }
}

/**
 * Records a successful use. The counter is what detects a cloned authenticator:
 * a signature count that fails to grow is a replay, and the next use is refused.
 */
export async function touchAdminPasskey(credentialId: string, counter: number): Promise<void> {
  try {
    await ensureAdminPasskeyTable()
    await pool.query(
      `UPDATE "adminPasskey" SET "counter" = $2, "lastUsedAt" = now() WHERE "credentialId" = $1`,
      [credentialId, counter],
    )
  } catch (error) {
    console.warn('[passkey] Could not update the counter:', (error as Error).message)
  }
}

export async function deleteAdminPasskey(id: number): Promise<boolean> {
  try {
    await ensureAdminPasskeyTable()
    const result = await pool.query(`DELETE FROM "adminPasskey" WHERE "id" = $1`, [id])
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.warn('[passkey] Could not remove the passkey:', (error as Error).message)
    return false
  }
}

export async function countAdminPasskeys(): Promise<number> {
  const passkeys = await listAdminPasskeys()
  return passkeys.length
}

/** True when the deployment can issue passkeys: an owner and a challenge secret. */
export async function isPasskeyAuthConfigured(): Promise<boolean> {
  return (await challengeSecret()) !== null
}

/**
 * The secret that signs challenge cookies. It is the owner's session secret, so
 * a password change or a new deployment environment invalidates an in-flight
 * challenge rather than leaving one reusable.
 */
async function challengeSecret(): Promise<string | null> {
  const explicit = process.env.ADMIN_PASSKEY_SECRET?.trim()
  if (explicit) return explicit
  const identity = await getAdminIdentity()
  return identity?.sessionSecret || process.env.BETTER_AUTH_SECRET || null
}

export async function getChallengeSecret(): Promise<string | null> {
  return challengeSecret()
}

export type RelyingParty = { rpID: string; origin: string; rpName: string }

/**
 * The WebAuthn relying party for this request.
 *
 * `origin` is the browser's own origin — a credential is bound to it — while
 * `rpID` is the registrable domain so the same passkey works on the apex, `www`
 * and `cms`. An explicit `ADMIN_PASSKEY_RP_ID` / `ADMIN_PASSKEY_ORIGIN` overrides
 * both for a deployment that needs a different domain.
 */
export function relyingPartyFor(request: Request): RelyingParty | null {
  const headerOrigin =
    request.headers.get('origin') ||
    (() => {
      const host = request.headers.get('host')
      if (!host) return ''
      const proto =
        request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
        (process.env.NODE_ENV === 'production' ? 'https' : 'http')
      return `${proto}://${host}`
    })()

  let origin: URL
  try {
    origin = new URL(process.env.ADMIN_PASSKEY_ORIGIN?.trim() || headerOrigin || SITE_URL)
  } catch {
    return null
  }

  const rpID = process.env.ADMIN_PASSKEY_RP_ID?.trim() || registrableRpId(origin.hostname)
  if (!rpID) return null

  // The origin must be inside the RP ID's scope, or the browser and the verifier
  // would disagree about which site the credential belongs to.
  const inScope =
    origin.hostname === rpID ||
    origin.hostname.endsWith(`.${rpID}`) ||
    (rpID === 'localhost' && (origin.hostname === 'localhost' || origin.hostname === '127.0.0.1'))
  if (!inScope) return null

  return { rpID, origin: origin.origin, rpName: 'Ashok Rimal Studio' }
}

/** Same-origin only: a passkey mutation must never be posted by another site. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === request.headers.get('host')
  } catch {
    return false
  }
}
