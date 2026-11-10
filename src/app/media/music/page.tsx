import MediaCategoryPage from '@/components/media/MediaCategoryPage'

export const revalidate = 300

export default function MusicCollectionPage() {
  return <MediaCategoryPage kind="music" />
}
