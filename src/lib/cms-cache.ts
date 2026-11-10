/**
 * Cache keys for the CMS content layer.
 *
 * Every published-content read is cached under the shared `cms-content` tag plus
 * a per-collection tag, so a mutation can invalidate one collection or the whole
 * CMS without disabling caching for the public pages.
 */
export const CMS_CACHE_TAG = 'cms-content'

/** How long cached CMS content lives before it is re-read, in seconds. */
export const CMS_REVALIDATE_SECONDS = 300

export function cmsCollectionTag(collection: string) {
  return `cms:${collection.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}
