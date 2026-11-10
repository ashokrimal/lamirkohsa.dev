import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import os from 'os'
import { promises as fs } from 'fs'
import { desc } from 'drizzle-orm'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { inboxMessage } from '@/lib/db/schema'
import {
  ADMIN_SESSION_COOKIE,
  isAdminAuthConfigured,
  verifyAdminBasicAuthHeader,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'

/**
 * Contact messages.
 *
 * Delivery is attempted on three channels so no single failure loses a message:
 *  1. the `inboxMessage` table (durable),
 *  2. Resend email to the owner (RESEND_API_KEY),
 *  3. a JSON file — the repo copy in development, /tmp on serverless runtimes
 *     where the project directory is read-only.
 */
type Message = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

const REPO_FILE = path.join(process.cwd(), 'data', 'messages.json')
const TMP_FILE = path.join(os.tmpdir(), 'portfolio-messages.json')

function recipient() {
  return process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || ''
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function readFile(pathname: string): Promise<Message[]> {
  try {
    const data = await fs.readFile(pathname, 'utf8')
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? (parsed as Message[]) : []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`[messages] Could not read ${pathname}:`, (error as Error).message)
    }
    return []
  }
}

/** Stores the message in the first writable location; returns the path used. */
async function persist(message: Message): Promise<string | null> {
  for (const pathname of [REPO_FILE, TMP_FILE]) {
    try {
      const existing = await readFile(pathname)
      await fs.writeFile(pathname, JSON.stringify([message, ...existing].slice(0, 500), null, 2), 'utf8')
      return pathname
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? (error as Error).message
      console.warn(`[messages] ${pathname} is not writable: ${code}`)
    }
  }
  return null
}

async function storeInDatabase(message: Message): Promise<boolean> {
  try {
    await db
      .insert(inboxMessage)
      .values({
        id: message.id,
        fromEmail: `${message.name} <${message.email}>`,
        toEmail: recipient() || message.email,
        subject: message.subject,
        textBody: message.message,
        htmlBody: [
          `<p><strong>${escapeHtml(message.name)}</strong> &lt;${escapeHtml(message.email)}&gt;</p>`,
          `<p><strong>${escapeHtml(message.subject)}</strong></p>`,
          `<p>${escapeHtml(message.message).replace(/\n/g, '<br />')}</p>`,
        ].join(''),
      })
      .onConflictDoNothing()
    return true
  } catch (error) {
    console.warn('[messages] Database insert failed:', (error as Error).message)
    return false
  }
}

async function deliverByEmail(message: Message): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to = recipient()
  if (!apiKey || !to) return false

  const domain = process.env.RESEND_EMAIL_DOMAIN || 'ashokrimal.com.np'
  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: `Portfolio Contact <contact@${domain}>`,
      to,
      replyTo: message.email,
      subject: `New message: ${message.subject} (from ${message.name})`,
      text: `Name: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\n\n${message.message}`,
    })
    if (error) {
      console.error('[messages] Resend rejected the email:', error.message)
      return false
    }
    return true
  } catch (error) {
    console.error('[messages] Resend request failed:', (error as Error).message)
    return false
  }
}

function parseFrom(fromEmail: string | null): { name: string; email: string } {
  if (!fromEmail) return { name: '', email: '' }
  const match = fromEmail.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (match) return { name: match[1], email: match[2] }
  return { name: '', email: fromEmail }
}

async function readDatabaseMessages(): Promise<Message[]> {
  try {
    const rows = await db
      .select()
      .from(inboxMessage)
      .orderBy(desc(inboxMessage.receivedAt))
      .limit(200)

    return rows.map((row) => {
      const { name, email } = parseFrom(row.fromEmail)
      return {
        id: row.id,
        name: name || email,
        email,
        subject: row.subject,
        message: row.textBody ?? '',
        createdAt: new Date(row.receivedAt).toISOString(),
      }
    })
  } catch (error) {
    console.warn('[messages] Could not read the inbox table:', (error as Error).message)
    return []
  }
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; subject?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.trim()
  const subject = body.subject?.trim()
  const text = body.message?.trim()

  if (!name || !email || !subject || !text) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const message: Message = {
    id: crypto.randomUUID(),
    name,
    email,
    subject,
    message: text,
    createdAt: new Date().toISOString(),
  }

  const [stored, delivered, persistedAt] = await Promise.all([
    storeInDatabase(message),
    deliverByEmail(message),
    persist(message),
  ])

  if (!stored && !delivered && !persistedAt) {
    return NextResponse.json(
      {
        error:
          'The message could not be delivered. Email delivery and message storage are both unavailable.',
      },
      { status: 503 },
    )
  }

  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  // Either the signed admin session cookie or env-backed basic auth (for scripts).
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const authorized =
    (await verifyAdminSessionToken(sessionCookie)) ||
    (await verifyAdminBasicAuthHeader(request.headers.get('authorization')))

  if (!authorized) {
    return NextResponse.json(
      { error: (await isAdminAuthConfigured()) ? 'Unauthorized' : 'Admin sign-in is not configured.' },
      { status: (await isAdminAuthConfigured()) ? 401 : 503 },
    )
  }

  const [dbMessages, repoMessages, tmpMessages] = await Promise.all([
    readDatabaseMessages(),
    readFile(REPO_FILE),
    readFile(TMP_FILE),
  ])

  const byId = new Map<string, Message>()
  for (const entry of [...dbMessages, ...repoMessages, ...tmpMessages]) {
    if (entry?.id) byId.set(entry.id, entry)
  }

  const messages = [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json(messages, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' },
  })
}
