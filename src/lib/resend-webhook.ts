import { verifySvixSignature, type SvixHeaders } from './webhook-auth'

/**
 * Request handling for Resend's inbound-email webhook, kept free of the
 * database and of `NextRequest` so the auth, payload and event decisions can be
 * tested. The route performs the returned insert.
 */
export interface InboxMessageValues {
  id: string
  fromEmail: string
  toEmail: string
  subject: string
  textBody: string | null
  htmlBody: string | null
}

export type ResendWebhookResult = {
  status: 200 | 400 | 401 | 503
  body: Record<string, unknown>
  insert?: InboxMessageValues
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function planResendWebhook({
  headers,
  rawBody,
  secret,
  payload,
  now,
}: {
  headers: SvixHeaders
  rawBody: string
  secret: string | undefined
  payload: unknown
  now?: number
}): ResendWebhookResult {
  const auth = verifySvixSignature({ headers, payload: rawBody, secret, now })
  if (auth === 'missing-config') {
    return { status: 503, body: { error: 'Webhook is not configured' } }
  }
  if (auth === 'unauthorized') return { status: 401, body: { error: 'Unauthorized' } }

  if (!isRecord(payload)) return { status: 400, body: { error: 'Invalid email event' } }
  if (payload.type !== 'email.received') return { status: 200, body: { received: true } }

  const data = isRecord(payload.data) ? payload.data : payload
  const email = isRecord(data.email) ? data.email : data
  const { id, from, to } = email
  if (typeof id !== 'string' || !id) return { status: 400, body: { error: 'Invalid email event' } }
  if (typeof from !== 'string' || !from) {
    return { status: 400, body: { error: 'Invalid email event' } }
  }
  if (!(typeof to === 'string' || (Array.isArray(to) && to.every((item) => typeof item === 'string')))) {
    return { status: 400, body: { error: 'Invalid email event' } }
  }

  return {
    status: 200,
    body: { received: true },
    insert: {
      id,
      fromEmail: from,
      toEmail: Array.isArray(to) ? to.join(', ') : to,
      subject: typeof email.subject === 'string' && email.subject ? email.subject : '(no subject)',
      textBody: typeof email.text === 'string' ? email.text : null,
      htmlBody: typeof email.html === 'string' ? email.html : null,
    },
  }
}
