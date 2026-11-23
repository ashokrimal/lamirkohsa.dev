import type { JsonLd } from '@/lib/structured-data'

/**
 * Renders structured data inline.
 *
 * `<` is escaped because the JSON sits inside a `<script>` element: a CMS string
 * containing `</script>` would otherwise close the tag and inject markup. The
 * escaped form is still valid JSON, so parsers read the same object.
 */
export function JsonLd({ data }: { data: JsonLd }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
