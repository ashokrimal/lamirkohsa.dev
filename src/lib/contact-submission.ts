/**
 * Validation for the public contact form.
 *
 * The endpoint is anonymous, so everything here is deliberately strict: every
 * field is capped, unknown shapes are rejected, and a filled honeypot is
 * answered as success without ever reaching the database or the mail provider.
 */

export const CONTACT_FIELD_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
} as const

export type ContactSubmission = {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactDecision =
  | { kind: 'accept'; submission: ContactSubmission }
  | { kind: 'drop'; reason: 'honeypot' }
  | { kind: 'reject'; status: 400; error: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readField(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key]
  return typeof value === 'string' ? value.trim() : undefined
}

export function planContactSubmission(body: unknown): ContactDecision {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { kind: 'reject', status: 400, error: 'Invalid request.' }
  }

  const record = body as Record<string, unknown>

  // Honeypot: a real visitor never sees this field. Bots fill it, so accept
  // silently and persist nothing — the response is identical to a real send.
  if (readField(record, 'website')) {
    return { kind: 'drop', reason: 'honeypot' }
  }

  const name = readField(record, 'name')
  const email = readField(record, 'email')
  const subject = readField(record, 'subject')
  const message = readField(record, 'message')

  if (!name || !email || !subject || !message) {
    return { kind: 'reject', status: 400, error: 'All fields are required.' }
  }

  if (name.length > CONTACT_FIELD_LIMITS.name) {
    return {
      kind: 'reject',
      status: 400,
      error: `Name must be ${CONTACT_FIELD_LIMITS.name} characters or fewer.`,
    }
  }

  if (email.length > CONTACT_FIELD_LIMITS.email) {
    return {
      kind: 'reject',
      status: 400,
      error: `Email must be ${CONTACT_FIELD_LIMITS.email} characters or fewer.`,
    }
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { kind: 'reject', status: 400, error: 'Enter a valid email address.' }
  }

  if (subject.length > CONTACT_FIELD_LIMITS.subject) {
    return {
      kind: 'reject',
      status: 400,
      error: `Subject must be ${CONTACT_FIELD_LIMITS.subject} characters or fewer.`,
    }
  }

  if (message.length > CONTACT_FIELD_LIMITS.message) {
    return {
      kind: 'reject',
      status: 400,
      error: `Message must be ${CONTACT_FIELD_LIMITS.message} characters or fewer.`,
    }
  }

  return { kind: 'accept', submission: { name, email, subject, message } }
}
