import MediaCategoryPage from '@/components/media/MediaCategoryPage'

export const revalidate = 300

export default function MoviesPage() {
  return <MediaCategoryPage kind="movies" />
}
