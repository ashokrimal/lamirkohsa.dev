import { Suspense } from 'react'
import MediaHomeContent from '@/components/media/MediaHomeContent'
import MediaHomeSkeleton from '@/components/media/MediaHomeSkeleton'
export const dynamic = 'force-dynamic'
export default function MediaPage() { return <Suspense fallback={<MediaHomeSkeleton />}><MediaHomeContent /></Suspense> }
