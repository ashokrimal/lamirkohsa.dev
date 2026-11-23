#!/usr/bin/env node
/**
 * Generates a secret for the studio's second factor.
 *
 * Run it once, paste the value into the deployment as ADMIN_TOTP_SECRET, then add
 * the otpauth URI to an authenticator app (or type the secret in by hand). The
 * secret is printed here and nowhere else — it is never written to a file.
 *
 *   node scripts/admin-totp-setup.mjs owner@example.com
 */

import { randomBytes } from 'node:crypto'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32(buffer) {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31]
  return output
}

const account = (process.argv[2] || process.env.ADMIN_EMAIL || 'owner').trim()
const issuer = 'Ashok Rimal Studio'
const secret = base32(randomBytes(20))

const uri = `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?${new URLSearchParams({
  secret,
  issuer,
  algorithm: 'SHA1',
  digits: '6',
  period: '30',
}).toString()}`

console.log('')
console.log('  Studio second factor')
console.log('  ────────────────────')
console.log(`  Account : ${account}`)
console.log(`  Secret  : ${secret}`)
console.log('')
console.log('  1. Add ADMIN_TOTP_SECRET to the deployment environment (Production,')
console.log('     and Preview if you sign in there) with the secret above.')
console.log('  2. In your authenticator app, add an account from this URI:')
console.log('')
console.log(`     ${uri}`)
console.log('')
console.log('  3. Redeploy. /admin/sign-in now asks for the current six digits')
console.log('     after the password.')
console.log('')
console.log('  Keep the secret out of git — it is a password for the studio.')
console.log('')
