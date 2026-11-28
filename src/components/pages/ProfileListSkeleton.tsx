import { PageSkeleton } from '@/components/ui/LoadingSkeletons'

export default function ProfileListSkeleton({ label = 'Loading collection' }: { label?: string }) {
  return <PageSkeleton variant="rows" label={label} />
}
