import { blogPostAnnouncement } from '@/lib/email-templates'
import { journalAddress, readMailConfig, sendMailBatch, type MailMessage } from '@/lib/mailer'
import {
  listActiveSubscribers,
  unsubscribeUrlFor,
  type NewsletterSubscriber,
} from '@/lib/newsletter-store'
import { SITE_URL } from '@/lib/seo'

/**
 * Emails every journal subscriber when a post is published from the studio.
 *
 * The planning step is pure so the recipients, URLs and unsubscribe links can be
 * tested without a mail provider; delivery is best-effort and never throws, so a
 * mail outage cannot roll back the publish itself.
 */

export type PublishedPost = {
  title: string
  slug: string
  excerpt?: string
}

export function planBlogAnnouncements({
  post,
  subscribers,
  siteUrl,
  from,
}: {
  post: PublishedPost
  subscribers: NewsletterSubscriber[]
  siteUrl: string
  from: string
}): MailMessage[] {
  const url = `${siteUrl}/blogs/${post.slug}`

  return subscribers.map((subscriber) => ({
    ...blogPostAnnouncement({
      title: post.title,
      url,
      excerpt: post.excerpt,
      siteUrl,
      unsubscribeUrl: unsubscribeUrlFor(subscriber.token),
    }),
    to: subscriber.email,
    from,
  }))
}

export async function notifySubscribersOfPost(
  post: PublishedPost,
): Promise<{ sent: number; failed: number; skipped?: string }> {
  const config = readMailConfig()
  if (!config) return { sent: 0, failed: 0, skipped: 'email is not configured' }

  const subscribers = await listActiveSubscribers(500)
  if (!subscribers.length) return { sent: 0, failed: 0, skipped: 'no subscribers' }

  try {
    const messages = planBlogAnnouncements({
      post,
      subscribers,
      siteUrl: SITE_URL,
      from: journalAddress(config.domain),
    })
    const result = await sendMailBatch(messages)
    console.info(
      `[newsletter] Announced "${post.title}" to ${result.sent} subscriber(s), ${result.failed} failed.`,
    )
    return result
  } catch (error) {
    console.warn('[newsletter] Could not announce the post:', (error as Error).message)
    return { sent: 0, failed: subscribers.length }
  }
}
