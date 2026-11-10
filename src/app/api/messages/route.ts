import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { db } from '@/lib/db'
import { inboxMessage } from '@/lib/db/schema'
import { Resend } from 'resend'

// Serverless-safe fallback path in /tmp
const DATA_FILE = path.join(process.env.VERCEL ? '/tmp' : process.cwd(), 'data', 'messages.json')
const ADMIN_EMAIL = 'admin@lamirkohsa.dev'
const ADMIN_PASSWORD = 'ashokrimal9847177515'

// Memory buffer fallback
const inMemoryMessages: any[] = []

async function readMessages() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8')
    return JSON.parse(data) as any[]
  } catch {
    return inMemoryMessages
  }
}

async function writeMessages(messages: unknown[]) {
  try {
    const dir = path.dirname(DATA_FILE)
    await fs.mkdir(dir, { recursive: true }).catch(() => {})
    await fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), 'utf8')
  } catch {
    // Filesystem read-only or unavailable in serverless
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body as {
      name?: string
      email?: string
      subject?: string
      message?: string
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    const messageId = crypto.randomUUID()
    const newEntry = {
      id: messageId,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    }

    // 1. Persist to PostgreSQL inbox table
    try {
      await db.insert(inboxMessage).values({
        id: messageId,
        fromEmail: `${name} <${email}>`,
        toEmail: 'info.ashokrimal@gmail.com',
        subject,
        textBody: message,
        htmlBody: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
      }).onConflictDoNothing()
    } catch (dbErr) {
      console.warn('[Messages] Database insert fallback:', dbErr)
    }

    // 2. Dispatch via Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const domain = process.env.RESEND_EMAIL_DOMAIN || 'ashokrimal.com.np'
        await resend.emails.send({
          from: `Portfolio Contact <contact@${domain}>`,
          to: 'info.ashokrimal@gmail.com',
          replyTo: email,
          subject: `New Message: ${subject} (from ${name})`,
          text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
        })
      } catch (emailErr) {
        console.warn('[Messages] Resend dispatch note:', emailErr)
      }
    }

    // 3. Fallback cache
    inMemoryMessages.unshift(newEntry)
    const messages = await readMessages()
    messages.unshift(newEntry)
    await writeMessages(messages)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving message', error)
    return NextResponse.json({ error: 'Failed to save message.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Basic ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base64Credentials = authHeader.split(' ')[1]
  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8')
  const [email, password] = decoded.split(':')

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const messages = await readMessages()
    return NextResponse.json(messages, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error reading messages', error)
    return NextResponse.json({ error: 'Failed to read messages.' }, { status: 500 })
  }
}

