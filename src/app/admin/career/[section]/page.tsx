import { notFound } from 'next/navigation'
import VaultPage from '@/components/admin/vaults/VaultPage'
import { CAREER_SECTION_TABS } from '@/lib/admin-vaults'

export const dynamic = 'force-dynamic'

export default async function CareerSectionVaultPage(
  props: {
    params: Promise<{ section: string }>
  }
) {
  const params = await props.params;
  const tab = CAREER_SECTION_TABS[params.section.toLowerCase()]
  if (!tab) notFound()
  return <VaultPage vault="career" initialTab={tab} />
}
