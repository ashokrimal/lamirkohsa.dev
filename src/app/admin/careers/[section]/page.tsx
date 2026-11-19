import { notFound, redirect } from 'next/navigation'
import { CAREER_SECTION_TABS } from '@/lib/admin-vaults'

export const dynamic = 'force-dynamic'

export default function CareersSectionAliasPage({
  params,
}: {
  params: { section: string }
}) {
  const key = params.section.toLowerCase()
  if (!CAREER_SECTION_TABS[key]) notFound()
  redirect(`/admin/career/${key}`)
}
