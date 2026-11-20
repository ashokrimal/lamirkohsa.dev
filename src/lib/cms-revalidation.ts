import { revalidatePath, revalidateTag } from 'next/cache'
import {
  CMS_CACHE_TAG,
  CMS_PUBLIC_REVALIDATE_PATHS,
  cmsCollectionTag,
} from '@/lib/cms-cache'

/**
 * Invalidates Next.js Data Cache tags and ISR routes after any CMS mutation.
 */
export function revalidateCmsCache(...collections: Array<string | undefined>) {
  // Next.js 16 requires the cache life profile; expire immediately so the next
  // request refetches instead of serving the entry that was just changed.
  revalidateTag(CMS_CACHE_TAG, { expire: 0 })
  for (const collection of collections) {
    if (collection) {
      revalidateTag(cmsCollectionTag(collection), { expire: 0 })
    }
  }

  for (const path of CMS_PUBLIC_REVALIDATE_PATHS) {
    revalidatePath(path)
  }

  revalidatePath('/projects/[slug]', 'page')
  revalidatePath('/blogs/[slug]', 'page')
}
