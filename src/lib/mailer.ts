import { Resend } from 'resend'
import type { EmailContent } from '@/lib/email-templates'

/**
 * One place that knows how this site sends mail.
 *
 * Everything leaves from the verified Resend domain: acknowledgements and
 * replies from `no-reply@`, the journal from `journal@`. When RESEND_API_KEY is
 * missing the callers treat mail as unavailable instead of throwing.
 */

export type MailConfig = {
  apiKey: string
  domain: string
  ownerEmail: string
}

export type MailMessage = EmailContent & {
  to: string
  from: string
  replyTo?: string
}

export function readMailConfig(): MailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  return {
    apiKey,
    domain: process.env.RESEND_EMAIL_DOMAIN?.trim() || 'ashokrimal.com.np',
    ownerEmail: (process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || '').trim(),
  }
}

export type MailEnvName = 'RESEND_API_KEY' | 'RESEND_EMAIL_DOMAIN' | 'CONTACT_TO_EMAIL'

/**
 * Names the mail variables that are missing, in the order the site needs them.
 * `ADMIN_EMAIL` counts as a contact inbox, matching `readMailConfig`.
 */
export function findMissingMailEnv(
  env: Record<string, string | undefined> = process.env,
): MailEnvName[] {
  const missing: MailEnvName[] = []
  if (!env.RESEND_API_KEY?.trim()) missing.push('RESEND_API_KEY')
  if (!env.RESEND_EMAIL_DOMAIN?.trim()) missing.push('RESEND_EMAIL_DOMAIN')
  if (!(env.CONTACT_TO_EMAIL?.trim() || env.ADMIN_EMAIL?.trim())) {
    missing.push('CONTACT_TO_EMAIL')
  }
  return missing
}

/**
 * Startup check: says once, in the server log, which mail variables are missing
 * so a deployment without them is visible instead of silently skipping email.
 * Missing variables degrade mail, they do not stop the site.
 */
export function reportMailConfiguration(
  env: Record<string, string | undefined> = process.env,
): MailEnvName[] {
  const missing = findMissingMailEnv(env)
  if (missing.length > 0) {
    console.warn(
      `[mail] Email is not fully configured. Missing: ${missing.join(', ')}. ` +
        'Contact acknowledgements, the journal welcome and blog announcements are skipped until these are set.',
    )
  }
  return missing
}

export function noReplyAddress(domain: string) {
  return `Ashok Rimal <no-reply@${domain}>`
}

export function journalAddress(domain: string) {
  return `Journal · Ashok Rimal <journal@${domain}>`
}

export type SendResult = { ok: true } | { ok: false; error: string }

export async function sendMail(message: MailMessage): Promise<SendResult> {
  const config = readMailConfig()
  if (!config) return { ok: false, error: 'email is not configured' }

  try {
    const resend = new Resend(config.apiKey)
    const { error } = await resend.emails.send({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    })
    if (error) {
      console.error('[mail] Resend rejected the message:', error.message)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (error) {
    console.error('[mail] Resend request failed:', (error as Error).message)
    return { ok: false, error: (error as Error).message }
  }
}

/**
 * Sends many messages through Resend's batch endpoint (100 per request).
 * Failures are counted, never thrown: a newsletter run must not break the
 * publish that triggered it.
 */
export async function sendMailBatch(messages: MailMessage[]): Promise<{
  sent: number
  failed: number
}> {
  const config = readMailConfig()
  if (!config || messages.length === 0) {
    return { sent: 0, failed: messages.length }
  }

  const resend = new Resend(config.apiKey)
  let sent = 0
  let failed = 0

  for (let index = 0; index < messages.length; index += 100) {
    const chunk = messages.slice(index, index + 100)
    try {
      const { data, error } = await resend.batch.send(
        chunk.map((message) => ({
          from: message.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
          ...(message.replyTo ? { replyTo: message.replyTo } : {}),
        })),
      )
      if (error) {
        console.error('[mail] Resend batch rejected:', error.message)
        failed += chunk.length
        continue
      }
      sent += data?.data?.length ?? chunk.length
    } catch (error) {
      console.error('[mail] Resend batch failed:', (error as Error).message)
      failed += chunk.length
    }
  }

  return { sent, failed }
}
