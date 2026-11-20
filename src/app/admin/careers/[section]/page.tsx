import { notFound, redirect } from 'next/navigation'
import { CAREER_SECTION_TABS } from '@/lib/admin-vaults'

export const dynamic = 'force-dynamic'

export default async function CareersSectionAliasPage(
  props: {
    params: Promise<{ section: string }>
  }
) {
  const params = await props.params;
  const key = params.section.toLowerCase()
  if (!CAREER_SECTION_TABS[key]) notFound()
  redirect(`/admin/career/${key}`)
}
