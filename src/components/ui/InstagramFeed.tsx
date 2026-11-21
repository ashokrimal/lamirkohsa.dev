import { SectionHeader } from '@/components/ui/SectionHeader'

/**
 * SnapWidget's iframe embed is used instead of their script tag so no
 * third-party script runs on this origin. An empty or malformed id renders
 * nothing, which is how the gallery hides the feed.
 */
const EMBED_BASE = 'https://snapwidget.com/embed/'

function isWidgetId(value: string) {
  return /^[A-Za-z0-9-]{8,64}$/.test(value)
}

/** The feed itself, without any heading chrome. */
export function InstagramEmbed({
  widgetId,
  fallbackHref,
  fallbackLabel,
  className = '',
}: {
  widgetId?: string
  /** Shown under the frame for people whose browser blocks the third party. */
  fallbackHref?: string
  fallbackLabel?: string
  className?: string
}) {
  const id = (widgetId ?? '').trim()
  if (!isWidgetId(id)) return null

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <iframe
          src={`${EMBED_BASE}${encodeURIComponent(id)}`}
          title="Posts from Instagram"
          allow="autoplay; fullscreen"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="block w-full"
          style={{ border: 'none', aspectRatio: '765 / 510', overflow: 'hidden' }}
        />
      </div>
      {fallbackHref && fallbackLabel && (
        <p className="mt-3 text-xs text-muted">
          <a href={fallbackHref} className="underline underline-offset-4 hover:text-ink">
            {fallbackLabel}
          </a>
        </p>
      )}
    </div>
  )
}

/**
 * The gallery's built-in Instagram block, used when the page has no enabled
 * `instagram` section in Studio → Pages. Both routes render the same embed; the
 * section route gets its heading and CTA from the CMS instead.
 */
export function InstagramFeed({
  widgetId,
  title,
  description,
  followHref,
  followLabel,
  fallbackLabel,
  className = '',
}: {
  widgetId?: string
  title: string
  description?: string
  followHref?: string
  followLabel?: string
  fallbackLabel?: string
  className?: string
}) {
  if (!isWidgetId((widgetId ?? '').trim())) return null

  return (
    // Same section rhythm as PageSection, so the gallery ends like every other page.
    <section aria-label={title} className={`pt-12 md:pt-16 ${className}`}>
      <SectionHeader
        eyebrow="Social"
        title={title}
        description={description}
        linkHref={followHref}
        linkLabel={followLabel}
      />
      <InstagramEmbed
        widgetId={widgetId}
        fallbackHref={followHref}
        fallbackLabel={fallbackLabel}
        className="mt-8"
      />
    </section>
  )
}
