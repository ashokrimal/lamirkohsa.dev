import { SITE_NAME } from '@/lib/seo'

/**
 * Email bodies built as plain data, so the wording and escaping can be tested
 * without a mail provider. Every builder returns text and HTML that say the
 * same thing.
 */

export type EmailContent = {
  subject: string
  text: string
  html: string
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clamp(value: string, max: number): string {
  const trimmed = value.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed
}

/** Adds one `Re:` and never stacks a second one on an already-replied subject. */
export function replySubject(subject: string): string {
  const trimmed = subject.trim()
  if (!trimmed) return 'Re: your message'
  return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`
}

function htmlDocument(body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;max-width:560px">${body}</div>`
}

function footer(siteUrl: string): string {
  return `<p style="margin-top:28px;font-size:12px;color:#6b7280">${escapeHtml(
    SITE_NAME,
  )} · <a href="${siteUrl}" style="color:#0d9488">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a></p>`
}

export function contactAcknowledgement({
  name,
  subject,
  message,
  siteUrl,
}: {
  name: string
  subject: string
  message: string
  siteUrl: string
}): EmailContent {
  const firstName = name.trim().split(/\s+/)[0] || 'there'
  const about = clamp(subject, 160)
  const quoted = clamp(message, 1200)

  const text = [
    `Hi ${firstName},`,
    '',
    `Thanks for getting in touch about "${about}". Your message reached me, and I'll reply personally as soon as I can — usually within a couple of days.`,
    '',
    'If your note was about a project, a specific task or a collaboration, I will come back with the details you asked for.',
    '',
    'What you sent:',
    ...quoted.split('\n').map((line) => `> ${line}`),
    '',
    'If you want to add anything, just reply to this email.',
    '',
    `— ${SITE_NAME}`,
    siteUrl,
  ].join('\n')

  const html = htmlDocument(`
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Thanks for getting in touch about <strong>${escapeHtml(about)}</strong>. Your message reached me, and I'll reply personally as soon as I can — usually within a couple of days.</p>
    <p>If your note was about a project, a specific task or a collaboration, I will come back with the details you asked for.</p>
    <blockquote style="margin:18px 0;padding:12px 16px;border-left:3px solid #d1d5db;background:#f9fafb;white-space:pre-wrap;color:#374151">${escapeHtml(
      quoted,
    )}</blockquote>
    <p>If you want to add anything, just reply to this email.</p>
    <p>— ${escapeHtml(SITE_NAME)}</p>
    ${footer(siteUrl)}
  `)

  return { subject: `Thanks for your message: ${about}`, text, html }
}

export function newsletterWelcome({
  siteUrl,
  unsubscribeUrl,
}: {
  siteUrl: string
  unsubscribeUrl: string
}): EmailContent {
  const journalUrl = `${siteUrl}/blogs`

  const text = [
    `Thanks for subscribing to the ${SITE_NAME} journal newsletter.`,
    '',
    'You will get an email whenever a new post is published — notes on building things, the CMS behind this site, and whatever I am learning next.',
    '',
    `Read the journal: ${journalUrl}`,
    '',
    'No spam, and you can leave any time:',
    unsubscribeUrl,
    '',
    `— ${SITE_NAME}`,
  ].join('\n')

  const html = htmlDocument(`
    <p>Thanks for subscribing to the <strong>${escapeHtml(SITE_NAME)} journal</strong> newsletter.</p>
    <p>You will get an email whenever a new post is published — notes on building things, the CMS behind this site, and whatever I am learning next.</p>
    <p><a href="${journalUrl}" style="color:#0d9488">Read the journal →</a></p>
    <p style="font-size:12px;color:#6b7280">No spam, and you can <a href="${unsubscribeUrl}" style="color:#6b7280">unsubscribe any time</a>.</p>
    ${footer(siteUrl)}
  `)

  return { subject: `You're subscribed to the ${SITE_NAME} journal`, text, html }
}

export function blogPostAnnouncement({
  title,
  url,
  excerpt,
  siteUrl,
  unsubscribeUrl,
}: {
  title: string
  url: string
  excerpt?: string
  siteUrl: string
  unsubscribeUrl: string
}): EmailContent {
  const headline = clamp(title, 160)
  const summary = excerpt ? clamp(excerpt, 400) : ''
  const postUrl = url.startsWith('http') ? url : `${siteUrl}${url}`

  const text = [
    `A new post is up: ${headline}`,
    '',
    ...(summary ? [summary, ''] : []),
    `Read it: ${postUrl}`,
    '',
    `— ${SITE_NAME}`,
    '',
    'You get these because you subscribed to the journal newsletter.',
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n')

  const html = htmlDocument(`
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:6px">New in the journal</p>
    <h1 style="font-size:20px;line-height:1.35;margin:0 0 12px">${escapeHtml(headline)}</h1>
    ${summary ? `<p style="color:#374151">${escapeHtml(summary)}</p>` : ''}
    <p><a href="${postUrl}" style="color:#0d9488">Read the post →</a></p>
    ${footer(siteUrl)}
    <p style="font-size:11px;color:#9ca3af">You get these because you subscribed to the journal newsletter. <a href="${unsubscribeUrl}" style="color:#9ca3af">Unsubscribe</a>.</p>
  `)

  return { subject: `${headline} · new in the ${SITE_NAME} journal`, text, html }
}
