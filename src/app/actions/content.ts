'use server'

import { db } from '@/lib/db'
import { cmsContent, inboxMessage } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { getAdminActorId } from '@/lib/admin-auth'

async function requireUser(): Promise<string> {
  const actorId = await getAdminActorId()
  if (!actorId) throw new Error('Unauthorized: sign in to the admin studio first.')
  return actorId
}

export async function getAdminContent() {
  const userId = await requireUser()
  try {
    const [cms, messages] = await Promise.all([
      db
        .select({
          id: cmsContent.id,
          collection: cmsContent.collection,
          title: cmsContent.title,
          payload: cmsContent.payload,
          status: cmsContent.status,
        })
        .from(cmsContent)
        .where(eq(cmsContent.userId, userId))
        .orderBy(cmsContent.sortOrder, desc(cmsContent.createdAt)),
      db
        .select({
          id: inboxMessage.id,
          fromEmail: inboxMessage.fromEmail,
          subject: inboxMessage.subject,
          textBody: inboxMessage.textBody,
          receivedAt: inboxMessage.receivedAt,
          readAt: inboxMessage.readAt,
        })
        .from(inboxMessage)
        .orderBy(desc(inboxMessage.receivedAt))
        .limit(100),
    ])

    return { cms, messages }
  } catch (error) {
    console.warn('[Admin Content] Database unavailable:', error)
  }

  // Nothing is invented when the database is unreachable: the studio simply
  // shows an empty state until records exist.
  return { cms: [], messages: [] }
}
