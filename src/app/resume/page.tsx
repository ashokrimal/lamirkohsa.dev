import CollectionPage from '@/components/pages/CollectionPage'
import { PrintResumeButton } from '@/components/ui/PrintResumeButton'
import './print.css'

export const revalidate = 300

export default function ResumePage() {
  return <CollectionPage kind="resume" heroActions={<PrintResumeButton />} />
}
