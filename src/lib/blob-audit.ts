/**
 * Which uploaded files nothing refers to any more.
 *
 * Deleting a gallery item, replacing a cover image or removing a section leaves
 * its file in the Blob store: the row is gone, the bytes are not. Over a year of
 * edits that is paid-for storage nobody is looking at.
 *
 * The check is deliberately conservative. A file counts as referenced when its
 * pathname or URL appears anywhere in the content the site can render — CMS
 * payloads, page sections, case studies, social links — compared after stripping
 * the query string, because `next/image` appends one. A file that is only
 * mentioned by a value this code cannot see is kept, not deleted.
 */

export interface StoredBlob {
  pathname: string
  url: string
  size: number
  uploadedAt: string
}

export interface BlobAudit {
  referenced: string[]
  orphaned: StoredBlob[]
  totalBytes: number
  orphanedBytes: number
}

function withoutQuery(value: string): string {
  return value.split('?')[0]
}

/** One searchable string for everything the database can point at. */
export function buildReferenceCorpus(values: readonly unknown[]): string {
  return withoutQuery(values.map((value) => JSON.stringify(value ?? '')).join('\n'))
}

export function findOrphanedBlobs(blobs: readonly StoredBlob[], corpus: string): BlobAudit {
  const referenced: string[] = []
  const orphaned: StoredBlob[] = []

  for (const blob of blobs) {
    const pathname = withoutQuery(blob.pathname)
    const url = withoutQuery(blob.url)
    // Either spelling counts: CMS records store a URL, section content may store
    // a pathname, and an editor could paste either.
    if ((url && corpus.includes(url)) || (pathname && corpus.includes(pathname))) {
      referenced.push(blob.pathname)
    } else {
      orphaned.push(blob)
    }
  }

  return {
    referenced,
    orphaned,
    totalBytes: blobs.reduce((total, blob) => total + (blob.size || 0), 0),
    orphanedBytes: orphaned.reduce((total, blob) => total + (blob.size || 0), 0),
  }
}

/**
 * The deletions a confirmed request is allowed to make.
 *
 * The client never decides what to delete: it sends pathnames, and only the ones
 * this server just found orphaned are returned. A request for anything else is
 * ignored rather than trusted.
 */
export function selectDeletableBlobs(
  requested: readonly string[],
  orphaned: readonly StoredBlob[],
  limit = 100,
): StoredBlob[] {
  const allowed = new Map(orphaned.map((blob) => [blob.pathname, blob]))
  const chosen: StoredBlob[] = []
  const seen = new Set<string>()

  for (const pathname of requested) {
    if (typeof pathname !== 'string' || seen.has(pathname)) continue
    seen.add(pathname)
    const blob = allowed.get(pathname)
    if (!blob) continue
    chosen.push(blob)
    if (chosen.length >= limit) break
  }

  return chosen
}
