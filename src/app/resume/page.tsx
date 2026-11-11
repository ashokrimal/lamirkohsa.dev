import type { Metadata } from 'next'
import CollectionPage from '@/components/pages/CollectionPage'
import { PrintResumeButton } from '@/components/ui/PrintResumeButton'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'
import './print.css'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data.resume : undefined)
}

export default function ResumePage() {
  return <CollectionPage kind="resume" heroActions={<PrintResumeButton />} />
}
