import { NotebookPen } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { blogParagraphs } from '@/lib/blog-article'

/**
 * The article body as the public page and the studio preview both render it.
 * One implementation means a draft cannot look different from the page it will
 * become once published.
 */
export function BlogArticleBody({
  body,
  emptyMessage,
  emptyHint,
  className = 'mt-10 md:mt-14',
}: {
  body: string
  emptyMessage: string
  emptyHint?: string
  className?: string
}) {
  const paragraphs = blogParagraphs(body)

  if (!paragraphs.length) {
    return (
      <div className={className}>
        <EmptyState
          eyebrow="Journal Entry"
          icon={NotebookPen}
          message={emptyMessage}
          hint={emptyHint}
        />
      </div>
    )
  }

  return (
    <article className={`${className} max-w-3xl space-y-5`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-sm md:text-base text-ink-secondary leading-7">
          {paragraph}
        </p>
      ))}
    </article>
  )
}
