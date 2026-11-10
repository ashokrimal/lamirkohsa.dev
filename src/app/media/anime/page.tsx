import MediaCategoryPage from '@/components/media/MediaCategoryPage'

export const revalidate = 300

export default function AnimeCollectionPage() {
  return <MediaCategoryPage kind="anime" />
}
