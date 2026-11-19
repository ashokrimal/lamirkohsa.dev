import { getAdminContent } from '@/app/actions/content'
import { requireAdminStudio } from '@/lib/admin-page-auth'
import { VAULTS, VAULT_ROUTES, recordsForVault, type VaultId } from '@/lib/admin-vaults'
import VaultWorkspace from '@/components/admin/vaults/VaultWorkspace'

export default async function VaultPage({
  vault,
  initialTab,
}: {
  vault: VaultId
  /** Focuses one section of the vault, e.g. education inside the career vault. */
  initialTab?: string
}) {
  const definition = VAULTS[vault]
  await requireAdminStudio(VAULT_ROUTES[vault])
  const content = await getAdminContent()
  const records = recordsForVault(definition, content.cms)
  const tab = definition.tabs.some((entry) => entry.id === initialTab)
    ? initialTab
    : undefined

  return (
    <VaultWorkspace
      vault={definition}
      records={records}
      initialTabId={tab}
      storageReady={Boolean(
        process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
      )}
    />
  )
}
