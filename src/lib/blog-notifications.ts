import { blogPostAnnouncement } from '@/lib/email-templates'
import { journalAddress, readMailConfig, sendMailBatch, type MailMessage } from '@/lib/mailer'
import {
  claimAnnouncement,
  listActiveSubscribers,
  NEWSLETTER_MAX_RECIPIENTS,
  releaseAnnouncement,
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
): Promise<{ sent: number; failed: number; skipped?: string; cappedAt?: number }> {
  const config = readMailConfig()
  if (!config) return { sent: 0, failed: 0, skipped: 'email is not configured' }

  const subscribers = await listActiveSubscribers(NEWSLETTER_MAX_RECIPIENTS)
  if (!subscribers.length) return { sent: 0, failed: 0, skipped: 'no subscribers' }

  // One post, one announcement. A second save that keeps the post published must
  // not email the list again, so the first caller claims the slug.
  const postKey = `blogs:${post.slug}`
  if (!(await claimAnnouncement(postKey, post.title))) {
    return { sent: 0, failed: 0, skipped: 'already announced' }
  }

  try {
    const messages = planBlogAnnouncements({
      post,
      subscribers,
      siteUrl: SITE_URL,
      from: journalAddress(config.domain),
    })
    const result = await sendMailBatch(messages)
    // A send that failed for every recipient is not an announcement; hand the
    // claim back so the next publish (or retry) can deliver it.
    if (result.sent === 0 && result.failed > 0) {
      await releaseAnnouncement(postKey)
      console.warn(`[newsletter] "${post.title}" was not announced; the claim was released.`)
      return result
    }
    console.info(
      `[newsletter] Announced "${post.title}" to ${result.sent} subscriber(s), ${result.failed} failed.`,
    )
    return {
      ...result,
      ...(subscribers.length >= NEWSLETTER_MAX_RECIPIENTS
        ? { cappedAt: NEWSLETTER_MAX_RECIPIENTS }
        : {}),
    }
  } catch (error) {
    await releaseAnnouncement(postKey)
    console.warn('[newsletter] Could not announce the post:', (error as Error).message)
    return { sent: 0, failed: subscribers.length }
  }
}
