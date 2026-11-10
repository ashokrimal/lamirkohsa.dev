import MediaDetailPage from '@/components/media/MediaDetailPage'

// This archive pulls live library data on each request, so it is not cached.
export const dynamic = 'force-dynamic'

export default function GitHubPage() {
  return <MediaDetailPage category="github" />
}
