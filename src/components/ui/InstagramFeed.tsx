import { SectionHeader } from '@/components/ui/SectionHeader'

/**
 * The gallery's Instagram feed.
 *
 * SnapWidget's iframe embed is used instead of their script tag so no
 * third-party script runs on this origin. The widget id, heading and caption
 * come from `UI Copy`, so the feed can be retitled or removed from the admin
 * without a deploy; an invalid or empty id renders nothing.
 */
export function InstagramFeed({
  widgetId,
  title,
  description,
  className = '',
}: {
  widgetId?: string
  title: string
  description?: string
  className?: string
}) {
  const id = (widgetId ?? '').trim()
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return null

  return (
    <section aria-label={title} className={`mt-14 border-t border-line pt-10 md:mt-20 md:pt-12 ${className}`}>
      <SectionHeader eyebrow="Social" title={title} description={description} />
      <div className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
        <iframe
          src={`https://snapwidget.com/embed/${encodeURIComponent(id)}`}
          title={`${title} — posts from Instagram`}
          allow="autoplay; fullscreen"
          loading="lazy"
          className="block w-full"
          style={{ border: 'none', aspectRatio: '765 / 510', overflow: 'hidden' }}
        />
      </div>
    </section>
  )
}
