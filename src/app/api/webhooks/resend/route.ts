import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inboxMessage } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (secret && request.headers.get('x-resend-webhook-secret') !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await request.json()
  if (payload.type !== 'email.received') return NextResponse.json({ received: true })
  const data = payload.data ?? payload
  const email = data.email ?? data
  if (!email.id || !email.from || !email.to) return NextResponse.json({ error: 'Invalid email event' }, { status: 400 })
  await db.insert(inboxMessage).values({ id: email.id, fromEmail: email.from, toEmail: Array.isArray(email.to) ? email.to.join(', ') : email.to, subject: email.subject || '(no subject)', textBody: email.text || null, htmlBody: email.html || null }).onConflictDoNothing()
  return NextResponse.json({ received: true })
}
