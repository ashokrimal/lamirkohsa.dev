import { UiCopyEditor } from '@/components/admin/UiCopyEditor'
import { getUiCopyOverrides } from '@/lib/ui-copy'
import { flattenUiStrings } from '@/lib/ui-strings'

export const dynamic = 'force-dynamic'

export default async function UiCopyPage() {
  const overrides = await getUiCopyOverrides()
  return <UiCopyEditor entries={flattenUiStrings()} overrides={overrides} />
}
