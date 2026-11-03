import { Suspense } from 'react'
import MediaHomeContent from '@/components/media/MediaHomeContent'
import { MediaDataSkeleton } from '@/components/media/MediaDataSkeleton'
export const dynamic = 'force-dynamic'
export default function MediaPage() { return <Suspense fallback={<MediaDataSkeleton />}><MediaHomeContent /></Suspense> }
