/**
 * The token for the project's Vercel Blob store.
 *
 * Vercel issues either the integration name or the legacy name, depending on
 * how the store was attached to the project, so both are accepted.
 */
export function blobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ||
    ''
  )
}

/**
 * A store's access mode is fixed when it is created, and the SDK rejects a
 * mismatch. The store that serves studio media is public, so scheduled
 * snapshots default to public too; a store created as private needs
 * CMS_BACKUP_BLOB_ACCESS=private.
 */
export function cmsSnapshotAccess(): 'public' | 'private' {
  return process.env.CMS_BACKUP_BLOB_ACCESS === 'private' ? 'private' : 'public'
}
