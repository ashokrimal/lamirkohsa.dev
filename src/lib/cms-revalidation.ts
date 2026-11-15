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
  revalidateTag(CMS_CACHE_TAG)
  for (const collection of collections) {
    if (collection) {
      revalidateTag(cmsCollectionTag(collection))
    }
  }

  for (const path of CMS_PUBLIC_REVALIDATE_PATHS) {
    revalidatePath(path)
  }

  revalidatePath('/projects/[slug]', 'page')
  revalidatePath('/blogs/[slug]', 'page')
}
