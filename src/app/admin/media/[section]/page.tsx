import { notFound } from 'next/navigation'
import VaultPage from '@/components/admin/vaults/VaultPage'
import { MEDIA_SECTION_TABS } from '@/lib/admin-vaults'

export const dynamic = 'force-dynamic'

export default async function MediaSectionVaultPage(
  props: {
    params: Promise<{ section: string }>
  }
) {
  const params = await props.params;
  const tab = MEDIA_SECTION_TABS[params.section.toLowerCase()]
  if (!tab) notFound()
  return <VaultPage vault="media" initialTab={tab} />
}
