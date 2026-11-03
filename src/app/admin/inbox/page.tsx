import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { desc, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { inboxMessage } from '@/lib/db/schema'

export default async function AdminInboxPage() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) redirect('/sign-in'); const messages = await db.select().from(inboxMessage).where(isNull(inboxMessage.archivedAt)).orderBy(desc(inboxMessage.receivedAt)); return <main className="admin-page shell-width"><header className="admin-header"><p className="section-label">Portfolio CMS / Inbox</p><h1>Received <em>mail.</em></h1><p>Incoming messages to no-reply@ashokrimal.com.np appear here.</p></header><section className="inbox-cms-grid">{messages.length ? messages.map((message) => <article className="inbox-cms-card" key={message.id}><div className="inbox-cms-meta"><span>{message.fromEmail}</span><time dateTime={message.receivedAt.toISOString()}>{message.receivedAt.toLocaleString()}</time></div><h2>{message.subject}</h2><p>{message.textBody || 'HTML email received. Open the original message from your mail client.'}</p><a href={`mailto:${message.fromEmail}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="text-link">Reply via email ↗</a></article>) : <div className="empty-state">No received email yet. Once the Resend webhook is connected, incoming mail will appear here.</div>}</section></main> }
