import CollectionPage from '@/components/pages/CollectionPage'

export const revalidate = 300

export default function CertificatesPage() {
  return <CollectionPage kind="certificates" />
}
