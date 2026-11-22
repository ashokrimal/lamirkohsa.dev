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
