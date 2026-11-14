import { getAdminContent } from '@/app/actions/content'
import { requireAdminStudio } from '@/lib/admin-page-auth'
import { VAULTS, VAULT_ROUTES, recordsForVault, type VaultId } from '@/lib/admin-vaults'
import VaultWorkspace from '@/components/admin/vaults/VaultWorkspace'

export default async function VaultPage({ vault }: { vault: VaultId }) {
  const definition = VAULTS[vault]
  await requireAdminStudio(VAULT_ROUTES[vault])
  const content = await getAdminContent()
  const records = recordsForVault(definition, content.cms)

  return (
    <VaultWorkspace
      vault={definition}
      records={records}
      storageReady={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
    />
  )
}
