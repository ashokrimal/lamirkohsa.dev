import { Suspense } from 'react'
import MediaHomeContent from '@/components/media/MediaHomeContent'
import MediaHomeSkeleton from '@/components/media/MediaHomeSkeleton'
export const revalidate = 300
export default function MediaPage() { return <Suspense fallback={<MediaHomeSkeleton />}><MediaHomeContent /></Suspense> }
